const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const U = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;

// Candidate photos per category. Broken ones are filtered out automatically.
const candidates = {
  Beach: ["1507525428034-b723cf961d3e", "1499793983690-e29da59ef1c2", "1505118380757-91f5f5632de0"],
  Windmills: ["1512470876302-972faa2aa9a4", "1534351590666-13e3e96b5017"],
  Modern: ["1564013799919-ab600027ffc6", "1613490493576-7fde63acd811", "1600585154340-be6161a56a0c"],
  Countryside: ["1518780664697-55e3ad937233", "1500382017468-9049fed747ef"],
  Pools: ["1600596542815-ffad4c1539a9", "1520250497591-112f2f40a3f4", "1576013551627-0cc20b96c2a7"],
  Islands: ["1514282401047-d79a71a590e8", "1573843981267-be1999ff37cd"],
  Lake: ["1470770841072-f978cf4d019e", "1506905925346-21bda4d32df4", "1449158743715-0a90ebb6d2d8"],
  Skiing: ["1551524164-687a55dd1126", "1520208422220-d12a3c588e6c"],
  Castles: ["1533154683836-84ea7a0bc310", "1520637836862-4d197d17c93a", "1467269204594-9661b134dd2b"],
  Caves: ["1527668752968-14dc70a27c95", "1569949381669-ecf31ae8e613"],
  Camping: ["1504280390367-361c6d9f38f4", "1478131143081-80f7f84ca84d", "1523987355523-c7b5b0dd90a7"],
  Arctic: ["1531366936337-7c912a4589a7", "1483347756197-71ef80e95f73"],
  Desert: ["1509316785289-025f5b846b35", "1473580044384-7ba9967e16a0"],
  Barns: ["1500076656116-558758c991c1", "1416879595882-3373a0480b5b"],
  Luxury: ["1512917774080-9991f1c4c750", "1600607687939-ce8a6c25118c", "1613977257363-707ba9348227"],
};

// Used for any category where none of the candidates load
const fallbackIds = [
  "1564013799919-ab600027ffc6",
  "1512917774080-9991f1c4c750",
  "1568605114967-8130f3a36994",
  "1570129477492-45c003edd2be",
];

async function works(url) {
  try {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), 8000);
    const r = await fetch(url, { method: "HEAD", signal: c.signal });
    clearTimeout(t);
    return r.ok;
  } catch {
    return false;
  }
}

async function filterWorking(ids) {
  const out = [];
  for (const id of ids) if (await works(U(id))) out.push(U(id));
  return out;
}

async function main() {
  const fallback = await filterWorking(fallbackIds);
  if (fallback.length === 0) {
    console.log("No Unsplash images are reachable from this network.");
    console.log("Try a mobile hotspot, a VPN, or change DNS to 8.8.8.8, then run again.");
    return;
  }

  const good = {};
  for (const [cat, ids] of Object.entries(candidates)) {
    const ok = await filterWorking(ids);
    good[cat] = ok.length ? ok : fallback;
    console.log(cat, ok.length ? `${ok.length} matching photos` : "using generic house photos");
  }

  const listings = await db.listing.findMany();
  const counter = {};
  for (const l of listings) {
    const urls = good[l.category] || fallback;
    counter[l.category] = (counter[l.category] || 0) + 1;
    const imageSrc = urls[(counter[l.category] - 1) % urls.length];
    await db.listing.update({ where: { id: l.id }, data: { imageSrc } });
  }
  console.log("Updated images for", listings.length, "listings");
}

main().catch(console.error).finally(() => db.$disconnect());