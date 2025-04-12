const path = require("path");

exports.uploadFile = (file, pathDir) => {
  if (file) {
    let image = file;
    let allowFiles = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowFiles.includes(image.mimetype)) {
      return next({
        status: 400,
        msg: "ຮູບຫ້ອງຄ້າຕ້ອງແມ່ນໄຟລຮູບພາບເທົ່ານັ້ນ",
      });
    }
    const ext = path.extname(image.name);
    const filename = Date.now() + ext;
    image.mv(
      path.join(__dirname, `../../uploads/images/${pathDir}/${filename}`)
    );
    return filename;
  }
  return null;
};
