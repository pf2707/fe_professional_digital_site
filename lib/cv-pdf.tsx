// The text CV as a PDF, made in the browser (components/cv/PdfButton.tsx loads
// this on click, so the PDF library only downloads when someone asks for it).
// Same content and order as components/cv/TextCv.tsx. Be Vietnam Pro (public/fonts)
// covers English and Vietnamese; Noto Sans SC is the fallback for Chinese and
// Japanese, fetched only when the CV has some.

import { Document, Font, Image, Link, Page, pdf, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Dict } from "@/lib/i18n/en";
import { longDate } from "@/lib/i18n";
import { archivedGroups, liveGroups, type Profile } from "@/lib/profile";

Font.register({
  family: "Be Vietnam Pro",
  fonts: [
    { src: "/fonts/BeVietnamPro-Regular.ttf" },
    { src: "/fonts/BeVietnamPro-SemiBold.ttf", fontWeight: 600 },
    { src: "/fonts/BeVietnamPro-Bold.ttf", fontWeight: 700 },
  ],
});
Font.register({ family: "Noto Sans SC", src: "/fonts/NotoSansSC-Regular.ttf" });
// Wrap whole words; the default splits them with hyphens.
Font.registerHyphenationCallback((word) => [word]);

const CJK = /[\u3000-\u30ff\u3400-\u9fff\uff00-\uffef]/;
// Neither font draws arrows.
const ARROWS: [RegExp, string][] = [[/[→⇒➜➔]/g, "->"], [/[←⇐]/g, "<-"], [/[↔⇔]/g, "<->"]];
const plain = (profile: Profile): Profile =>
  JSON.parse(ARROWS.reduce((text, [re, to]) => text.replace(re, to), JSON.stringify(profile)));

const INK = "#1d2433";
const DIM = "#5b6273";

const s = StyleSheet.create({
  page: { padding: "40 44 48", fontFamily: "Be Vietnam Pro", fontSize: 10, lineHeight: 1.5, color: INK },
  head: { flexDirection: "row", alignItems: "center", gap: 16 },
  photo: { width: 64, height: 64, borderRadius: 32 },
  name: { fontSize: 24, fontWeight: 700, lineHeight: 1.1 },
  role: { fontSize: 12, marginTop: 4 },
  meta: { fontSize: 9, color: DIM, marginTop: 6 },
  link: { color: DIM },
  h2: { fontSize: 12.5, fontWeight: 700, marginTop: 18, marginBottom: 6, paddingBottom: 3, borderBottom: `1.5 solid ${INK}` },
  h3: { fontSize: 10.5, fontWeight: 600, marginTop: 6 },
  muted: { color: DIM, fontSize: 9 },
  para: { marginBottom: 4 },
  item: { flexDirection: "row", marginBottom: 2 },
  bullet: { width: 10 },
  itemText: { flex: 1 },
  skill: { flexDirection: "row", marginBottom: 3 },
  skillGroup: { width: 150, paddingRight: 10, fontWeight: 600 },
});

// The photo, shrunk to a small JPEG (react-pdf can't draw WebP or SVG, and a
// full-size photo would make the file megabytes). "" when there's none or it fails.
const PHOTO = 256;
function smallPhoto(src: string): Promise<string> {
  if (!src) return Promise.resolve("");
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const side = Math.min(img.naturalWidth, img.naturalHeight);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = PHOTO;
      canvas
        .getContext("2d")!
        .drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, PHOTO, PHOTO);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };
    img.onerror = () => resolve("");
    img.src = src;
  });
}

const Bullet = ({ children }: { children: React.ReactNode }) => (
  <View style={s.item} wrap={false}>
    <Text style={s.bullet}>•</Text>
    <Text style={s.itemText}>{children}</Text>
  </View>
);

function CvDocument({ profile, photo, cjk, t }: { profile: Profile; photo: string; cjk: boolean; t: Dict }) {
  const c = t.textCv;
  const socials = profile.socials.filter((x) => x.title !== "Email");
  const meta = [profile.location, profile.languages, profile.phone].filter(Boolean);
  return (
    <Document title={`${profile.name} — CV`} author={profile.name} subject={profile.title} language={t.dateLocale}>
      <Page size="A4" style={[s.page, cjk ? { fontFamily: ["Be Vietnam Pro", "Noto Sans SC"] } : {}]}>
        <View style={s.head}>
          {photo && <Image src={photo} style={s.photo} />}
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{profile.name}</Text>
            <Text style={s.role}>{profile.title}</Text>
            <Text style={s.meta}>
              {[...meta, ""].join(" · ")}
              <Link src={`mailto:${profile.email}`} style={s.link}>
                {profile.email}
              </Link>
              {socials.map((x) => (
                <Text key={x.title}>
                  {" · "}
                  <Link src={x.href} style={s.link}>
                    {x.title}
                  </Link>
                </Text>
              ))}
            </Text>
          </View>
        </View>

        <Text style={s.h2}>{c.profile}</Text>
        {profile.about.map((p, i) => (
          <Text key={i} style={s.para}>
            {p}
          </Text>
        ))}

        <Text style={s.h2}>{c.experience}</Text>
        {profile.experience.map((e) => (
          <View key={e.role} wrap={false}>
            <Text style={s.h3}>{e.role}</Text>
            <Text style={s.muted}>
              {e.org}, {e.period}
            </Text>
            <Text style={s.para}>{e.summary}</Text>
          </View>
        ))}

        {profile.certificates.length > 0 && (
          <>
            <Text style={s.h2}>{c.certificates}</Text>
            {profile.certificates.map((x) => (
              <Bullet key={x.title}>
                {[x.title, x.issuer, x.instructor].filter(Boolean).join(" — ")}
                {x.date && `, ${longDate(t, new Date(x.date))}`}
              </Bullet>
            ))}
          </>
        )}

        <Text style={s.h2}>{c.skills}</Text>
        {profile.skills.map((x) => (
          <View key={x.group} style={s.skill} wrap={false}>
            <Text style={s.skillGroup}>{x.group}</Text>
            <Text style={s.itemText}>{x.items.join(", ")}</Text>
          </View>
        ))}

        <Text style={s.h2}>{c.projects}</Text>
        {[...liveGroups(profile), ...archivedGroups(profile)].map((g) => (
          <View key={g.key}>
            <Text style={s.h3}>{g.label}</Text>
            {profile.projects
              .filter((p) => p.category === g.key)
              .map((p) => (
                <Bullet key={p.name}>
                  <Text style={{ fontWeight: 600 }}>{p.name}</Text>: {p.description}
                </Bullet>
              ))}
          </View>
        ))}

      </Page>
    </Document>
  );
}

export async function cvPdf(profile: Profile, t: Dict): Promise<Blob> {
  const cv = plain(profile);
  const photo = await smallPhoto(cv.avatar);
  const cjk = CJK.test(JSON.stringify(cv));
  return pdf(<CvDocument profile={cv} photo={photo} cjk={cjk} t={t} />).toBlob();
}
