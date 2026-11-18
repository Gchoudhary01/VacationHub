const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient();

const rows = `Sunset Beach Villa|Beach|Greece|Europe|37|25
Palm Cove Bungalow|Beach|Thailand|Asia|8|98
Bondi Shore Retreat|Beach|Australia|Oceania|-34|151
Tulum Seaside Casita|Beach|Mexico|Americas|20|-87
Algarve Cliff House|Beach|Portugal|Europe|37|-8
Kinderdijk Windmill Stay|Windmills|Netherlands|Europe|52|5
Restored Mill House|Windmills|Denmark|Europe|56|10
La Mancha Windmill Loft|Windmills|Spain|Europe|39|-3
Zaanse Mill Cottage|Windmills|Netherlands|Europe|52|4
Tokyo Minimal Loft|Modern|Japan|Asia|35|139
Berlin Glass Studio|Modern|Germany|Europe|52|13
Hollywood Hills Residence|Modern|United States|Americas|34|-118
Dubai Marina Penthouse|Modern|United Arab Emirates|Asia|25|55
Tuscan Hillside Farmhouse|Countryside|Italy|Europe|43|11
Cotswold Stone Cottage|Countryside|United Kingdom|Europe|52|-2
Provence Lavender Home|Countryside|France|Europe|44|6
Vermont Maple Farmstay|Countryside|United States|Americas|44|-73
Infinity Pool Villa Bali|Pools|Indonesia|Asia|-8|115
Marrakech Riad with Pool|Pools|Morocco|Africa|31|-8
Palm Springs Pool House|Pools|United States|Americas|33|-116
Sicilian Pool Estate|Pools|Italy|Europe|37|14
Maldives Overwater Hut|Islands|Maldives|Asia|4|73
Santorini Island Home|Islands|Greece|Europe|36|25
Fiji Private Island Hut|Islands|Fiji|Oceania|-17|178
Seychelles Island Cottage|Islands|Seychelles|Africa|-4|55
Lake Como Lakeside Villa|Lake|Italy|Europe|46|9
Lake Tahoe Cabin|Lake|United States|Americas|39|-120
Lake Geneva Chalet|Lake|Switzerland|Europe|46|6
Banff Lakefront Lodge|Lake|Canada|Americas|51|-116
Zermatt Ski Chalet|Skiing|Switzerland|Europe|46|8
Aspen Slopeside Lodge|Skiing|United States|Americas|39|-107
Niseko Powder Cabin|Skiing|Japan|Asia|43|141
Chamonix Alpine Apartment|Skiing|France|Europe|46|7
Scottish Highland Castle|Castles|United Kingdom|Europe|57|-4
Loire Valley Chateau|Castles|France|Europe|47|1
Bavarian Hilltop Schloss|Castles|Germany|Europe|47|11
Irish Tower Castle|Castles|Ireland|Europe|53|-8
Cappadocia Cave Suite|Caves|Turkey|Asia|38|35
Matera Cave Dwelling|Caves|Italy|Europe|41|16
Granada Cave House|Caves|Spain|Europe|37|-3
Yosemite Forest Tent|Camping|United States|Americas|37|-119
Patagonia Glamping Dome|Camping|Chile|Americas|-51|-73
Lake District Camp Pod|Camping|United Kingdom|Europe|54|-3
Iceland Northern Lights Cabin|Arctic|Iceland|Europe|65|-19
Tromso Aurora Cabin|Arctic|Norway|Europe|69|19
Lapland Glass Igloo|Arctic|Finland|Europe|68|27
Sahara Dune Camp|Desert|Morocco|Africa|31|-4
Wadi Rum Desert Dome|Desert|Jordan|Asia|29|35
Arizona Adobe Casita|Desert|United States|Americas|34|-112
Cotswold Converted Barn|Barns|United Kingdom|Europe|51|-2
Normandy Timber Barn|Barns|France|Europe|49|0
Napa Valley Barn Loft|Barns|United States|Americas|38|-122
Monaco Luxury Penthouse|Luxury|Monaco|Europe|43|7
Mykonos Luxury Villa|Luxury|Greece|Europe|37|25
Beverly Hills Mansion|Luxury|United States|Americas|34|-118`.split("\n");

const desc = {
  Beach: "Wake up to the sound of waves just steps from the sand. Bright, airy rooms, a shaded terrace and everything you need for a relaxed seaside stay.",
  Windmills: "Stay inside a beautifully restored windmill with original beams, cozy interiors and open views over the surrounding fields.",
  Modern: "A sleek, design-led space with clean lines, large windows and top-end finishes, close to the best restaurants and sights.",
  Countryside: "A peaceful rural escape with rolling views, a garden for slow mornings and plenty of walking trails right from the door.",
  Pools: "Your own private pool surrounded by lounge areas and greenery. Perfect for long, lazy afternoons and evening drinks outdoors.",
  Islands: "A secluded island hideaway with crystal-clear water, soft sand and total privacy. Snorkel from the doorstep.",
  Lake: "Lakeside living with a private dock, sunrise views over the water and a fire pit for evenings outside.",
  Skiing: "Ski-in access to the slopes, a warm fireplace and a hot tub to unwind after a day on the mountain.",
  Castles: "Live like royalty in a historic castle with stone walls, grand halls and sweeping views of the grounds.",
  Caves: "A unique cave dwelling carved into the rock, naturally cool in summer and warm in winter, with charming handmade details.",
  Camping: "Sleep under the stars in comfort. Cozy bedding, a private fire pit and nature all around you.",
  Arctic: "A snug retreat in the far north with big windows for watching the northern lights and a sauna to warm up.",
  Desert: "A remote desert stay with endless dunes, vivid sunsets and a sky full of stars at night.",
  Barns: "A converted barn mixing rustic character with modern comfort: exposed timber, a spacious open-plan living area and a private garden.",
  Luxury: "A five-star private residence with premium amenities, stunning views and bespoke service during your stay.",
};

// Image search keywords per category (all tags must match)
const keywords = {
  Beach: "beach,house",
  Windmills: "windmill",
  Modern: "modern,house",
  Countryside: "cottage,countryside",
  Pools: "villa,pool",
  Islands: "island,resort",
  Lake: "lake,cabin",
  Skiing: "chalet,snow",
  Castles: "castle",
  Caves: "cave,house",
  Camping: "tent,camping",
  Arctic: "cabin,snow",
  Desert: "desert,camp",
  Barns: "barn",
  Luxury: "mansion,luxury",
};

const base = { Beach: 220, Windmills: 150, Modern: 240, Countryside: 130, Pools: 300, Islands: 380, Lake: 210, Skiing: 280, Castles: 420, Caves: 170, Camping: 90, Arctic: 260, Desert: 190, Barns: 160, Luxury: 750 };
const pick = (a) => a[Math.floor(Math.random() * a.length)];

async function main() {
  const user = await db.user.findFirst();
  if (!user) throw new Error("No user found. Sign up first, then run this again.");

  // Remove the old sample listings (keeps any listings you created yourself)
  const removed = await db.listing.deleteMany({
    where: {
      OR: [
        { imageSrc: { contains: "picsum.photos" } },
        { imageSrc: { contains: "loremflickr.com" } },
      ],
    },
  });
  console.log("Removed old sample listings:", removed.count);

  const data = rows.map((r, i) => {
    const [title, category, country, region, la, ln] = r.split("|");
    const guestCount = pick([2, 3, 4, 5, 6, 8]);
    const roomCount = Math.max(1, Math.floor(guestCount / 2));
    return {
      title,
      description: desc[category],
      imageSrc: `https://loremflickr.com/1200/800/${keywords[category]}/all?lock=${i + 1}`,
      category,
      roomCount,
      bathroomCount: Math.max(1, roomCount - pick([0, 0, 1])),
      guestCount,
      userId: user.id,
      price: Math.floor((base[category] * (0.7 + Math.random() * 0.7)) / 5) * 5,
      country,
      latlng: [parseInt(la), parseInt(ln)],
      region,
    };
  });

  const res = await db.listing.createMany({ data });
  console.log("Inserted listings:", res.count);
}

main().catch(console.error).finally(() => db.$disconnect());