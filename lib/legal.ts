// ─────────────────────────────────────────────────────────────────────────────
//  The privacy policy (/privacy) and terms of use (/terms), in both languages.
//  They describe what the site actually does; when that changes (a new service
//  that sees personal data, analytics, online payment…), update them and
//  LEGAL_UPDATED. Have a lawyer review them before relying on them.
// ─────────────────────────────────────────────────────────────────────────────

import { COMPANY, CONTACT } from "./business";
import type { Locale } from "./i18n";

export const LEGAL_UPDATED = new Date("2026-11-14T00:00:00Z");

// A paragraph, or a list when it's an array.
export type Block = string | string[];
export type LegalSection = { title: string; body: Block[] };
export type LegalDoc = { title: string; lede: string; sections: LegalSection[] };

const email = CONTACT.email;

const PRIVACY: Record<Locale, LegalDoc> = {
  en: {
    title: "Privacy policy",
    lede: `This policy explains what personal data Interactive 3D CV collects, why, who it is shared with, and the choices you have. The site is run by ${COMPANY} (“we”, “us”).`,
    sections: [
      {
        title: "Who is responsible",
        body: [
          `${COMPANY} is responsible for the personal data described here. You can reach us at ${email} about anything in this policy.`,
        ],
      },
      {
        title: "What we collect",
        body: [
          "When you create an account and a CV, we collect:",
          [
            "Account details: your email address and, if you sign in with Google, the name and account ID Google shares with us. Passwords are handled by Firebase Authentication; we never see them.",
            "Your CV: everything you enter in the editor, such as your name, job title, contact details, location, languages, career history, skills, certificates, projects, photo, and the place and colours you choose.",
            "Your digital twin's knowledge: the goal, summary and rules you write. The twin answers questions about you from these and from your CV.",
            "Your publishing request: the address you reserve and its approval status.",
          ],
          "When you visit a CV, we collect:",
          [
            "Messages you send to a digital twin, which are processed to produce an answer (see “Who we share data with”). We don't store chat conversations.",
            "Technical data that our hosting provider records to run the site, such as IP address, browser type and the pages requested.",
          ],
        ],
      },
      {
        title: "Why we use it",
        body: [
          [
            "To provide the service: save your CV, show it at your address, and let your digital twin answer visitors. We rely on our contract with you.",
            "To review and approve CVs before they go live, and to contact you about your publishing request.",
            "To keep the site secure and working, and to prevent abuse. We rely on our legitimate interest in running a safe service.",
            "To meet legal obligations.",
          ],
          "We don't sell your personal data, show ads, or use it to train AI models.",
        ],
      },
      {
        title: "What is public",
        body: [
          "Once your CV is approved and published, everything in its profile, including your photo and the contact details you add, is visible to anyone with the link and may be found by search engines. Your digital twin's knowledge is not shown on the page, but the twin answers visitors' questions from it, so only include what you're happy for it to share.",
        ],
      },
      {
        title: "Who we share data with",
        body: [
          "We use these service providers, who process data on our behalf:",
          [
            "Google Firebase (Authentication and Cloud Firestore): accounts, CVs and twin knowledge.",
            "Vercel: hosting the website and its server functions.",
            "OpenRouter and the AI model provider it routes to (currently Google Gemini): when a visitor chats with a digital twin, their messages, the CV and the twin's knowledge are sent to generate a reply. When you fill in the editor from a CV PDF, the PDF stays in your browser; only its text is sent to read its details, and neither is stored.",
            "Google, if you choose to sign in with Google.",
          ],
          "These providers may process data outside Vietnam, including in the United States. We may also disclose data when the law requires it.",
        ],
      },
      {
        title: "Cookies and browser storage",
        body: [
          "We don't use advertising or analytics cookies. The site stores only what it needs:",
          [
            "lang: remembers the language you chose (one year).",
            "Firebase Authentication keeps you signed in using your browser's storage.",
            "Your unsaved CV draft is kept in your browser's local storage until you save it.",
            "owner_session: signs in the site's administrator only.",
          ],
        ],
      },
      {
        title: "How long we keep it",
        body: [
          "We keep your account and CV while your account exists. If you ask us to delete them, we delete them within 30 days, except where the law requires us to keep something longer. Drafts in your browser stay until you clear them.",
        ],
      },
      {
        title: "Your rights",
        body: [
          "Under Vietnam's Decree 13/2023/ND-CP on personal data protection, and similar laws where you live, you can ask to access, correct or delete your personal data, withdraw your consent, object to or restrict its processing, and receive a copy of it. You can edit most of your data yourself in the editor. For anything else, email us at " +
            `${email}. We'll reply within the time the law allows. You can also complain to the data protection authority.`,
        ],
      },
      {
        title: "Security",
        body: [
          "Data is sent over encrypted connections (HTTPS) and stored with our providers' security controls. Only you can edit your CV, and only the site's administrator can approve it. No system is perfectly secure, so please use a strong password.",
        ],
      },
      {
        title: "Children",
        body: ["The service is for people aged 16 and over. We don't knowingly collect data from children."],
      },
      {
        title: "Changes to this policy",
        body: [
          "We'll update this page when our practices change, and change the date at the top. If a change is significant, we'll tell account holders by email.",
        ],
      },
    ],
  },
  vi: {
    title: "Chính sách quyền riêng tư",
    lede: `Chính sách này giải thích Interactive 3D CV thu thập dữ liệu cá nhân nào, vì sao, chia sẻ với ai, và những lựa chọn bạn có. Trang web do ${COMPANY} (“chúng tôi”) vận hành.`,
    sections: [
      {
        title: "Bên chịu trách nhiệm",
        body: [
          `${COMPANY} chịu trách nhiệm về dữ liệu cá nhân được mô tả ở đây. Bạn có thể liên hệ chúng tôi qua ${email} về bất kỳ nội dung nào trong chính sách này.`,
        ],
      },
      {
        title: "Chúng tôi thu thập gì",
        body: [
          "Khi bạn tạo tài khoản và CV, chúng tôi thu thập:",
          [
            "Thông tin tài khoản: địa chỉ email và, nếu bạn đăng nhập bằng Google, tên và mã tài khoản mà Google chia sẻ với chúng tôi. Mật khẩu do Firebase Authentication xử lý; chúng tôi không bao giờ thấy mật khẩu.",
            "CV của bạn: mọi thứ bạn nhập trong trình chỉnh sửa, như họ tên, chức danh, thông tin liên hệ, nơi sống, ngôn ngữ, quá trình làm việc, kỹ năng, chứng chỉ, dự án, ảnh, cùng địa điểm và màu sắc bạn chọn.",
            "Kiến thức của bản sao số: mục tiêu, phần tóm tắt và quy tắc bạn viết. Bản sao trả lời câu hỏi về bạn dựa trên những điều này và CV của bạn.",
            "Yêu cầu xuất bản: địa chỉ bạn giữ chỗ và trạng thái duyệt.",
          ],
          "Khi bạn xem một CV, chúng tôi thu thập:",
          [
            "Tin nhắn bạn gửi cho bản sao số, được xử lý để tạo câu trả lời (xem “Chúng tôi chia sẻ dữ liệu với ai”). Chúng tôi không lưu các cuộc trò chuyện.",
            "Dữ liệu kỹ thuật mà nhà cung cấp lưu trữ ghi lại để vận hành trang, như địa chỉ IP, loại trình duyệt và các trang được yêu cầu.",
          ],
        ],
      },
      {
        title: "Chúng tôi dùng dữ liệu để làm gì",
        body: [
          [
            "Để cung cấp dịch vụ: lưu CV, hiển thị CV tại địa chỉ của bạn và cho bản sao số trả lời khách. Cơ sở là hợp đồng giữa chúng tôi và bạn.",
            "Để xem xét và duyệt CV trước khi hoạt động, và liên hệ bạn về yêu cầu xuất bản.",
            "Để giữ trang web an toàn, hoạt động ổn định và ngăn chặn lạm dụng. Cơ sở là lợi ích chính đáng của chúng tôi trong việc vận hành một dịch vụ an toàn.",
            "Để tuân thủ nghĩa vụ pháp lý.",
          ],
          "Chúng tôi không bán dữ liệu cá nhân của bạn, không hiển thị quảng cáo và không dùng dữ liệu để huấn luyện mô hình AI.",
        ],
      },
      {
        title: "Những gì được công khai",
        body: [
          "Khi CV được duyệt và xuất bản, mọi thứ trong hồ sơ, gồm cả ảnh và thông tin liên hệ bạn thêm vào, sẽ hiển thị với bất kỳ ai có đường dẫn và có thể được công cụ tìm kiếm tìm thấy. Kiến thức của bản sao số không hiển thị trên trang, nhưng bản sao trả lời câu hỏi của khách dựa trên đó, vì vậy chỉ đưa vào những gì bạn sẵn lòng để nó chia sẻ.",
        ],
      },
      {
        title: "Chúng tôi chia sẻ dữ liệu với ai",
        body: [
          "Chúng tôi sử dụng các nhà cung cấp dịch vụ sau, xử lý dữ liệu thay mặt chúng tôi:",
          [
            "Google Firebase (Authentication và Cloud Firestore): tài khoản, CV và kiến thức của bản sao.",
            "Vercel: lưu trữ trang web và các chức năng máy chủ.",
            "OpenRouter và nhà cung cấp mô hình AI mà OpenRouter chuyển đến (hiện là Google Gemini): khi khách trò chuyện với bản sao số, tin nhắn của họ, CV và kiến thức của bản sao được gửi đi để tạo câu trả lời. Khi bạn điền trình chỉnh sửa từ CV dạng PDF, tệp PDF ở lại trong trình duyệt của bạn; chỉ phần chữ được gửi đi để đọc thông tin, và không có gì được lưu lại.",
            "Google, nếu bạn chọn đăng nhập bằng Google.",
          ],
          "Các nhà cung cấp này có thể xử lý dữ liệu bên ngoài Việt Nam, bao gồm tại Hoa Kỳ. Chúng tôi cũng có thể cung cấp dữ liệu khi pháp luật yêu cầu.",
        ],
      },
      {
        title: "Cookie và bộ nhớ trình duyệt",
        body: [
          "Chúng tôi không dùng cookie quảng cáo hay phân tích. Trang web chỉ lưu những gì cần thiết:",
          [
            "lang: ghi nhớ ngôn ngữ bạn chọn (một năm).",
            "Firebase Authentication giữ trạng thái đăng nhập bằng bộ nhớ của trình duyệt.",
            "Bản nháp CV chưa lưu được giữ trong bộ nhớ cục bộ của trình duyệt cho đến khi bạn lưu.",
            "owner_session: chỉ dùng để đăng nhập cho quản trị viên của trang.",
          ],
        ],
      },
      {
        title: "Thời gian lưu giữ",
        body: [
          "Chúng tôi giữ tài khoản và CV của bạn trong thời gian tài khoản còn tồn tại. Nếu bạn yêu cầu xoá, chúng tôi xoá trong vòng 30 ngày, trừ khi pháp luật yêu cầu giữ lâu hơn. Bản nháp trong trình duyệt còn đó cho đến khi bạn xoá.",
        ],
      },
      {
        title: "Quyền của bạn",
        body: [
          "Theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân, và các luật tương tự nơi bạn sống, bạn có quyền yêu cầu truy cập, chỉnh sửa hoặc xoá dữ liệu cá nhân, rút lại sự đồng ý, phản đối hoặc hạn chế việc xử lý, và nhận bản sao dữ liệu. Bạn có thể tự sửa phần lớn dữ liệu trong trình chỉnh sửa. Với các yêu cầu khác, hãy gửi email đến " +
            `${email}. Chúng tôi sẽ phản hồi trong thời hạn pháp luật cho phép. Bạn cũng có thể khiếu nại đến cơ quan bảo vệ dữ liệu cá nhân.`,
        ],
      },
      {
        title: "Bảo mật",
        body: [
          "Dữ liệu được truyền qua kết nối mã hoá (HTTPS) và lưu trữ với các biện pháp bảo mật của nhà cung cấp. Chỉ bạn mới chỉnh sửa được CV của mình, và chỉ quản trị viên của trang mới duyệt được CV. Không hệ thống nào an toàn tuyệt đối, vì vậy hãy dùng mật khẩu mạnh.",
        ],
      },
      {
        title: "Trẻ em",
        body: ["Dịch vụ dành cho người từ 16 tuổi trở lên. Chúng tôi không cố ý thu thập dữ liệu của trẻ em."],
      },
      {
        title: "Thay đổi chính sách",
        body: [
          "Chúng tôi sẽ cập nhật trang này khi cách làm của chúng tôi thay đổi, và đổi ngày ở đầu trang. Nếu thay đổi quan trọng, chúng tôi sẽ thông báo cho chủ tài khoản qua email.",
        ],
      },
    ],
  },
};

const TERMS: Record<Locale, LegalDoc> = {
  en: {
    title: "Terms of use",
    lede: `These terms govern your use of Interactive 3D CV, run by ${COMPANY}. By using the site you agree to them; if you don't, please don't use it.`,
    sections: [
      {
        title: "The service",
        body: [
          "Interactive 3D CV lets you build a CV that visitors explore as a 3D place, with an optional AI digital twin that answers questions about you. Anyone can view the sample and published CVs. You need an account to make your own.",
        ],
      },
      {
        title: "Your account",
        body: [
          "You must be at least 16 and give a real email address. Keep your password safe; you're responsible for what happens in your account. Tell us at once at " +
            `${email} if you think someone else has used it.`,
        ],
      },
      {
        title: "Publishing and payment",
        body: [
          "Reserving an address doesn't publish your CV. Payment is arranged directly with us, outside the website; once it's confirmed, we review your CV and, if it meets these terms, publish it at your address. We may decline to publish a CV that breaks these terms. Prices and what's included are agreed when you contact us. Some features, such as the digital twin on a published CV, may be premium features.",
          "Addresses are first come, first served and can't be changed once reserved. We may reclaim an address that impersonates someone, infringes a trademark, or is never published.",
        ],
      },
      {
        title: "Your content",
        body: [
          "You own what you put in your CV. You give us a worldwide, non-exclusive, royalty-free licence to store, display and process it (including sending it to the AI model that powers your twin) so we can run the service. The licence ends when you delete your content, except for copies kept in backups for a limited time or where the law requires.",
          "You're responsible for your content. It must be true, and you must have the right to use everything in it, including photos and other people's names.",
        ],
      },
      {
        title: "What you must not do",
        body: [
          [
            "Pretend to be someone else, or publish false qualifications or experience.",
            "Upload anything unlawful, defamatory, hateful, sexually explicit, or that infringes someone's rights.",
            "Put other people's personal data in your CV or twin knowledge without their permission.",
            "Try to make a digital twin reveal its instructions, produce harmful content, or otherwise misuse it.",
            "Attack, overload, scrape or reverse-engineer the site, or get around its limits or security.",
          ],
          "We may remove content or suspend accounts that break these rules.",
        ],
      },
      {
        title: "The digital twin",
        body: [
          "The twin's answers are generated by AI from the knowledge its owner provided. They can be incomplete or wrong. Visitors should confirm anything important, such as availability, rates or qualifications, with the CV's owner directly. Neither we nor the owner are bound by what the twin says.",
        ],
      },
      {
        title: "Our content",
        body: [
          "The site's design, 3D scenes, code and wording belong to us or our licensors. You may share links to CVs and the site, but not copy or resell the service itself.",
        ],
      },
      {
        title: "Availability and changes",
        body: [
          "We work to keep the site available but can't promise it will always be. We may change, add or remove features. If we stop the service, we'll give account holders reasonable notice by email so you can save your content.",
        ],
      },
      {
        title: "Ending your use",
        body: [
          `You can stop using the service at any time and ask us to delete your account at ${email}. We may suspend or end your access if you seriously or repeatedly break these terms.`,
        ],
      },
      {
        title: "Liability",
        body: [
          "The service is provided “as is”. To the extent the law allows, we aren't liable for indirect or consequential loss, such as a lost job opportunity, or for content that users create. Our total liability to you is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms limits liability that can't be limited by law, or your rights as a consumer.",
        ],
      },
      {
        title: "Privacy",
        body: ["How we handle personal data is explained in our privacy policy."],
      },
      {
        title: "Law and disputes",
        body: [
          "These terms are governed by the laws of Vietnam. We'll try to settle any dispute with you informally first; if we can't, it will be resolved by the competent courts of Vietnam. If these terms are translated, the Vietnamese and English versions have equal effect.",
        ],
      },
      {
        title: "Changes to these terms",
        body: [
          "We may update these terms. We'll change the date at the top, and tell account holders by email about significant changes before they take effect. Using the site after that means you accept the new terms.",
        ],
      },
    ],
  },
  vi: {
    title: "Điều khoản sử dụng",
    lede: `Các điều khoản này điều chỉnh việc bạn sử dụng Interactive 3D CV, do ${COMPANY} vận hành. Khi dùng trang web, bạn đồng ý với các điều khoản này; nếu không đồng ý, vui lòng không sử dụng.`,
    sections: [
      {
        title: "Dịch vụ",
        body: [
          "Interactive 3D CV cho phép bạn tạo một CV mà khách khám phá như một không gian 3D, kèm một bản sao số AI (không bắt buộc) trả lời câu hỏi về bạn. Ai cũng có thể xem CV mẫu và các CV đã xuất bản. Bạn cần tài khoản để tạo CV của riêng mình.",
        ],
      },
      {
        title: "Tài khoản của bạn",
        body: [
          "Bạn phải từ 16 tuổi trở lên và dùng địa chỉ email thật. Hãy giữ mật khẩu an toàn; bạn chịu trách nhiệm về những gì xảy ra trong tài khoản. Hãy báo ngay cho chúng tôi qua " +
            `${email} nếu bạn nghĩ có người khác đã dùng tài khoản của bạn.`,
        ],
      },
      {
        title: "Xuất bản và thanh toán",
        body: [
          "Giữ chỗ địa chỉ không có nghĩa là CV đã được xuất bản. Việc thanh toán được thoả thuận trực tiếp với chúng tôi, bên ngoài trang web; khi thanh toán được xác nhận, chúng tôi xem xét CV và, nếu CV phù hợp với các điều khoản này, xuất bản tại địa chỉ của bạn. Chúng tôi có thể từ chối xuất bản CV vi phạm các điều khoản này. Giá và những gì bao gồm được thống nhất khi bạn liên hệ. Một số tính năng, như bản sao số trên CV đã xuất bản, có thể là tính năng cao cấp.",
          "Địa chỉ được cấp theo thứ tự đăng ký trước và không thể đổi sau khi đã giữ chỗ. Chúng tôi có thể thu hồi địa chỉ mạo danh người khác, vi phạm nhãn hiệu, hoặc không bao giờ được xuất bản.",
        ],
      },
      {
        title: "Nội dung của bạn",
        body: [
          "Bạn sở hữu những gì bạn đưa vào CV. Bạn cấp cho chúng tôi quyền sử dụng toàn cầu, không độc quyền, miễn phí để lưu trữ, hiển thị và xử lý nội dung đó (bao gồm gửi đến mô hình AI vận hành bản sao của bạn) nhằm vận hành dịch vụ. Quyền này chấm dứt khi bạn xoá nội dung, trừ các bản sao trong bản sao lưu trong thời gian giới hạn hoặc khi pháp luật yêu cầu.",
          "Bạn chịu trách nhiệm về nội dung của mình. Nội dung phải đúng sự thật, và bạn phải có quyền sử dụng mọi thứ trong đó, bao gồm ảnh và tên của người khác.",
        ],
      },
      {
        title: "Những điều bạn không được làm",
        body: [
          [
            "Mạo danh người khác, hoặc đăng bằng cấp hay kinh nghiệm sai sự thật.",
            "Tải lên nội dung trái pháp luật, phỉ báng, kích động thù ghét, khiêu dâm, hoặc xâm phạm quyền của người khác.",
            "Đưa dữ liệu cá nhân của người khác vào CV hoặc kiến thức của bản sao khi chưa được họ cho phép.",
            "Tìm cách khiến bản sao số tiết lộ hướng dẫn của nó, tạo nội dung có hại, hoặc lạm dụng nó theo cách khác.",
            "Tấn công, làm quá tải, thu thập dữ liệu tự động hoặc dịch ngược trang web, hoặc vượt qua các giới hạn hay biện pháp bảo mật của trang.",
          ],
          "Chúng tôi có thể gỡ nội dung hoặc tạm khoá tài khoản vi phạm các quy định này.",
        ],
      },
      {
        title: "Bản sao số",
        body: [
          "Câu trả lời của bản sao được AI tạo ra từ kiến thức mà chủ nhân cung cấp. Chúng có thể chưa đầy đủ hoặc sai. Khách nên xác nhận trực tiếp với chủ nhân CV những điều quan trọng, như thời gian sẵn sàng, mức giá hay bằng cấp. Cả chúng tôi và chủ nhân đều không bị ràng buộc bởi những gì bản sao nói.",
        ],
      },
      {
        title: "Nội dung của chúng tôi",
        body: [
          "Thiết kế, các không gian 3D, mã nguồn và câu chữ của trang thuộc về chúng tôi hoặc bên cấp phép cho chúng tôi. Bạn có thể chia sẻ đường dẫn đến CV và trang web, nhưng không được sao chép hay bán lại chính dịch vụ.",
        ],
      },
      {
        title: "Tính sẵn sàng và thay đổi",
        body: [
          "Chúng tôi cố gắng duy trì trang web hoạt động nhưng không thể cam kết luôn luôn như vậy. Chúng tôi có thể thay đổi, thêm hoặc bỏ tính năng. Nếu ngừng dịch vụ, chúng tôi sẽ báo trước một khoảng thời gian hợp lý cho chủ tài khoản qua email để bạn lưu lại nội dung.",
        ],
      },
      {
        title: "Chấm dứt sử dụng",
        body: [
          `Bạn có thể ngừng dùng dịch vụ bất cứ lúc nào và yêu cầu xoá tài khoản qua ${email}. Chúng tôi có thể tạm ngừng hoặc chấm dứt quyền truy cập nếu bạn vi phạm nghiêm trọng hoặc nhiều lần các điều khoản này.`,
        ],
      },
      {
        title: "Trách nhiệm pháp lý",
        body: [
          "Dịch vụ được cung cấp “nguyên trạng”. Trong phạm vi pháp luật cho phép, chúng tôi không chịu trách nhiệm về thiệt hại gián tiếp hoặc hệ quả, như mất cơ hội việc làm, hay về nội dung do người dùng tạo. Tổng trách nhiệm của chúng tôi đối với bạn giới hạn ở số tiền bạn đã trả cho chúng tôi trong 12 tháng trước khi phát sinh khiếu nại. Không điều gì trong các điều khoản này giới hạn trách nhiệm mà pháp luật không cho phép giới hạn, hay quyền của bạn với tư cách người tiêu dùng.",
        ],
      },
      {
        title: "Quyền riêng tư",
        body: ["Cách chúng tôi xử lý dữ liệu cá nhân được giải thích trong chính sách quyền riêng tư."],
      },
      {
        title: "Luật áp dụng và tranh chấp",
        body: [
          "Các điều khoản này được điều chỉnh bởi pháp luật Việt Nam. Chúng tôi sẽ cố gắng giải quyết tranh chấp với bạn bằng thương lượng trước; nếu không được, tranh chấp sẽ do toà án có thẩm quyền của Việt Nam giải quyết. Bản tiếng Việt và bản tiếng Anh của các điều khoản này có giá trị như nhau.",
        ],
      },
      {
        title: "Thay đổi điều khoản",
        body: [
          "Chúng tôi có thể cập nhật các điều khoản này. Chúng tôi sẽ đổi ngày ở đầu trang, và thông báo cho chủ tài khoản qua email về các thay đổi quan trọng trước khi có hiệu lực. Tiếp tục dùng trang sau đó nghĩa là bạn chấp nhận điều khoản mới.",
        ],
      },
    ],
  },
};

export const privacyDoc = (locale: Locale) => PRIVACY[locale];
export const termsDoc = (locale: Locale) => TERMS[locale];
