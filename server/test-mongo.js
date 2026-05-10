const mongoose = require('mongoose');

const uri = "mongodb+srv://studyadmin:studyadmin123@cluster0.dctxyox.mongodb.net/studyrepo?appName=Cluster0";

mongoose.connect(uri, { serverSelectionTimeoutMS: 15000 })
  .then(() => {
    console.log("✅ SUCCESS! Connected to Atlas successfully.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ FAILED! Could not connect to Atlas.");
    console.error(err.message);
    process.exit(1);
  });
