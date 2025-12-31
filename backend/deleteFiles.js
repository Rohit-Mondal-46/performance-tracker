const cloudinary = require("./config/cloudinary");

async function deleteAllAssets() {
  const types = ["image", "video", "raw"];

  for (const type of types) {
    let nextCursor = null;

    do {
      const res = await cloudinary.api.resources({
        resource_type: type,
        max_results: 100, // reduce to avoid API stress
        next_cursor: nextCursor,
      });

      const publicIds = res.resources.map(r => r.public_id);

      if (publicIds.length > 0) {
        const result = await cloudinary.api.delete_resources(publicIds, {
          resource_type: type,
        });

        console.log(`Deleted ${publicIds.length} ${type} assets`);
        console.log(result);
      }

      nextCursor = res.next_cursor;
    } while (nextCursor);
  }

  console.log("✅ All Cloudinary assets deleted.");
}

/* 🔴 THIS IS CRITICAL */
deleteAllAssets().catch(err => {
  console.error("❌ Delete failed:");
  console.error(JSON.stringify(err, null, 2));
  process.exit(1);
});

/* 🔴 EXTRA SAFETY FOR NODE 22 */
process.on("unhandledRejection", err => {
  console.error("❌ Unhandled Rejection:");
  console.error(JSON.stringify(err, null, 2));
});
