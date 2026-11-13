# Interactive 3D CV Flow


Domain: http://localhost:3000 (I will change later)

- Main page will be a landing page (we implement later)
- /scene: open the 3D room and show sample information as current
- On the left or right should have multiple 3D designs. Click on each will update the main scene. (we will design more later or if you can do it now -> do it)
- /scene/admin: open edit page to update real information
- On Edit screen, allow Enable/Disable Digital Twin feature
- Add one more button "Publish". On publish page
    + allow user enter their path after /scene. For example: /thai-tran, /thuy-huynh, /nguyen-tran, /han-tran,.... but need duplicated validation on our database to see it existed or not because this is the unique path to open correct CV
    + Implement that http://locahost:3000/scene/<unique_id> will open exactly user CV
    + The main button on this page is "Submit" since we can not pay on the web so the CV will store on firestore. I will process payment and approve the CV before it lives
    + We use firestore database to keep track unique id and I will go firebase to approve
    + make sure digital twin on each CV only answer information for that CV. DON'T response mismatch information of other CVs