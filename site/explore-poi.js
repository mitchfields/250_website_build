// Interactive Map of American Historic Homes — all 60 entries from the
// v2 compliance source list.
//
// `mode` records how an entry meets the map:
//   'pin'  a single documented address — a normal marker
//   'dist' a housing type or community with no single site; pinned at the
//          representative location named in the source list, flagged so the
//          label can say so
//   'off'  outside the lower-48 frame (AK, HI) or off the planet (ISS);
//          reachable from the timeline, never drawn on the relief
//
// Era buckets are unequal in span and roughly equal in count: the dates cluster
// hard in 1840–1920, so equal decade-width segments would leave half the
// timeline empty and pile 30 homes into three cells.

export const LOREM = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent enim ad minim.';

export const ERAS = [
  { id: 'e01', label: '–1699', tick: '1000',     name: 'Before the Republic', from: -Infinity, to: 1699 },
  { id: 'e02', label: '1700–1799', tick: '1700', name: 'A New Nation',        from: 1700, to: 1799 },
  { id: 'e03', label: '1800–1839', tick: '1800', name: 'Early Republic',      from: 1800, to: 1839 },
  { id: 'e04', label: '1840–1859', tick: '1840', name: 'Westward',            from: 1840, to: 1859 },
  { id: 'e05', label: '1860–1874', tick: '1860', name: 'Civil War & After',   from: 1860, to: 1874 },
  { id: 'e06', label: '1875–1889', tick: '1875', name: 'Reconstruction',      from: 1875, to: 1889 },
  { id: 'e07', label: '1890–1899', tick: '1890', name: 'Gilded Age',          from: 1890, to: 1899 },
  { id: 'e08', label: '1900–1914', tick: '1900', name: 'A New Century',       from: 1900, to: 1914 },
  { id: 'e09', label: '1915–1929', tick: '1915', name: 'Between the Wars',    from: 1915, to: 1929 },
  { id: 'e10', label: '1930–1949', tick: '1930', name: 'Depression & War',    from: 1930, to: 1949 },
  { id: 'e11', label: '1950–1969', tick: '1950', name: 'Postwar Boom',        from: 1950, to: 1969 },
  { id: 'e12', label: '1970–NOW', tick: '1970',  name: 'Modern America',      from: 1970, to: Infinity },
];

// the year an entry sorts by — first four-digit number in its date string
const yearOf = d => {
  const m = String(d).match(/1[0-9]{3}|20[0-9]{2}/);
  return m ? +m[0] : 0;
};
const eraOf = y => (ERAS.find(e => y >= e.from && y <= e.to) || ERAS[0]).id;

// [ref, name, city, state, region, date, lat, lon, archetype, mode]
const RAW = [
  [ 1, 'Taos Pueblo',                    'Taos',            'NM', 'West',      'c. 1000–1450', 36.4390, -105.5450, 'pueblo',        'pin' ],
  [ 2, 'Paul Revere House',              'Boston',          'MA', 'Northeast', '1680',         42.3638,  -71.0537, 'colonial',      'pin' ],
  [ 3, 'Betsy Ross Home',                'Philadelphia',    'PA', 'Northeast', 'c. 1740',      39.9522,  -75.1445, 'rowhouse',      'pin' ],
  [ 4, 'Monticello',                     'Charlottesville', 'VA', 'South',     '1772',         38.0087,  -78.4534, 'neoclassical',  'pin' ],
  [ 5, 'Drayton Hall',                   'Charleston',      'SC', 'South',     '1738',         32.8069,  -80.0810, 'plantation',    'pin' ],
  [ 6, 'Jacob Dingee Townhouse',         'Wilmington',      'DE', 'Northeast', 'c. 1770',      39.7420,  -75.5490, 'rowhouse',      'pin' ],
  [ 7, 'Shaker Communities',             'Pittsfield',      'MA', 'Northeast', 'c. 1790s',     42.4260,  -73.3390, 'shaker',        'dist'],
  [ 8, 'Ridgely Family Estate',          'Towson',          'MD', 'Northeast', '1790',         39.4160,  -76.5860, 'plantation',    'pin' ],
  [ 9, 'Abraham Lincoln Home',           'Springfield',     'IL', 'Midwest',   '1839',         39.7975,  -89.6478, 'colonial',      'pin' ],
  [10, 'La Casa Cordova',                'Tucson',          'AZ', 'West',      'c. 1848',      32.2226, -110.9747, 'adobe',         'pin' ],
  [11, 'Brigham Young Home',             'Salt Lake City',  'UT', 'West',      '1854',         40.7702, -111.8880, 'colonial',      'pin' ],
  [12, 'Hay House',                      'Macon',           'GA', 'South',     '1859',         32.8354,  -83.6320, 'italianate',    'pin' ],
  [13, 'Grant-Kohrs Ranch',              'Deer Lodge',      'MT', 'West',      '1862',         46.4060, -112.7480, 'ranch',         'pin' ],
  [14, 'Booker T. Washington Home',      'Malden',          'WV', 'South',     'c. 1865',      38.3390,  -81.5060, 'cabin',         'pin' ],
  [15, 'Lakota and Plains Nations Tipi',  'near Cody',       'WY', 'West',      'c. 1800s',     44.5263, -109.0565, 'tipi',          'dist'],
  [16, 'Mark Twain House',               'Hartford',        'CT', 'Northeast', '1874',         41.7670,  -72.7010, 'stick',         'pin' ],
  [17, 'Coolidge Homestead',             'Plymouth Notch',  'VT', 'Northeast', '1840',         43.5450,  -72.7180, 'farmhouse',     'pin' ],
  [18, 'Frederick Douglass Home',        'Washington',      'DC', 'Northeast', '1855',         38.8630,  -76.9860, 'italianate',    'pin' ],
  [19, 'Willa Cather Childhood Home',    'Red Cloud',       'NE', 'Midwest',   'c. 1878',      40.0890,  -98.5190, 'farmhouse',     'pin' ],
  [20, 'Thomas Edison Home',             'West Orange',     'NJ', 'Northeast', '1880',         40.7870,  -74.2400, 'queenanne',     'pin' ],
  [21, 'Alfred Jackson Home',            'The Hermitage',   'TN', 'South',     'c. 1841–43',   36.2150,  -86.6130, 'cabin',         'pin' ],
  [22, 'American Gothic House',          'Eldon',           'IA', 'Midwest',   '1881',         40.9200,  -92.2230, 'gothic',        'pin' ],
  [23, 'Iolani Palace',                  'Honolulu',        'HI', 'West',      '1882',         21.3069, -157.8583, 'palace',        'off' ],
  [24, 'Winslow Homer Studio',           "Prout's Neck",    'ME', 'Northeast', '1884',         43.5470,  -70.3230, 'shingle',       'pin' ],
  [25, 'Augustus Saint-Gaudens Home',    'Cornish',         'NH', 'Northeast', 'c. 1817',      43.4970,  -72.3650, 'federal',       'pin' ],
  [26, 'Helen Keller Home',              'Tuscumbia',       'AL', 'South',     '1820',         34.7290,  -87.7020, 'cottage',       'pin' ],
  [27, 'Molly Brown House',              'Denver',          'CO', 'West',      '1889',         39.7373, -104.9800, 'queenanne',     'pin' ],
  [28, 'Ralph Middleton Munroe House',   'Miami',           'FL', 'South',     '1891',         25.7280,  -80.2430, 'bungalow',      'pin' ],
  [29, 'Alva Vanderbilt Home',           'Newport',         'RI', 'Northeast', '1892',         41.4620,  -71.3080, 'gilded',        'pin' ],
  [30, 'Biltmore',                       'Asheville',       'NC', 'South',     '1895',         35.5400,  -82.5520, 'chateau',       'pin' ],
  [31, 'Eisenhower Boyhood Home',        'Abilene',         'KS', 'Midwest',   '1887',         38.9200,  -97.2140, 'farmhouse',     'pin' ],
  [32, 'Ludwig and Christina Welk Home', 'Strasburg',       'ND', 'Midwest',   '1898',         46.1300, -100.1600, 'sod',           'pin' ],
  [33, 'Rogarshevsky Home',              'New York',        'NY', 'Northeast', '1863',         40.7188,  -73.9900, 'tenement',      'pin' ],
  [34, 'Glensheen Mansion',              'Duluth',          'MN', 'Midwest',   '1908',         46.8150,  -92.0510, 'jacobean',      'pin' ],
  [35, 'Brown Family Homestead',         'Philip',          'SD', 'Midwest',   '1909',         43.8830, -101.9200, 'sod',           'pin' ],
  [36, 'Frederick C. Robie House',       'Chicago',         'IL', 'Midwest',   '1910',         41.7900,  -87.5960, 'prairie',       'pin' ],
  [37, 'Frank Lloyd Wright Home',        'Spring Green',    'WI', 'Midwest',   '1911',         43.1410,  -90.0700, 'prairie',       'pin' ],
  [38, 'Wright Home',                    'Oakwood',         'OH', 'Midwest',   '1914',         39.7180,  -84.1730, 'colonial',      'pin' ],
  [39, 'Laura Ingalls Wilder Home',      'Mansfield',       'MO', 'Midwest',   '1896',         37.0980,  -92.5900, 'farmhouse',     'pin' ],
  [40, 'Oscar Anderson House',           'Anchorage',       'AK', 'West',      '1915',         61.2181, -149.9003, 'craftsman',     'off' ],
  [41, 'Edward Schulmerich House',       'Hillsboro',       'OR', 'West',      '1915',         45.5230, -122.9890, 'colonial',      'pin' ],
  [42, 'Hearst Castle',                  'San Simeon',      'CA', 'West',      '1919',         35.6850, -121.1680, 'mediterranean', 'pin' ],
  [43, 'Meadow Brook Hall',              'Rochester Hills', 'MI', 'Midwest',   '1926',         42.6700,  -83.2050, 'tudor',         'pin' ],
  [44, 'Sears, Roebuck & Co. Kit Homes', 'Carlinville',     'IL', 'Midwest',   'c. 1908–1940', 39.2795,  -89.8818, 'kit',           'dist'],
  [45, 'Fred L. Anspaugh Houseboat',     'Seattle',         'WA', 'West',      '1920s',        47.6360, -122.3320, 'houseboat',     'pin' ],
  [46, 'Thunderbird Lodge',              'Lake Tahoe',      'NV', 'West',      '1936',         39.2280, -119.9370, 'lodge',         'pin' ],
  [47, 'Post-WWII Suburb',               'Levittown',       'NY', 'Northeast', '1947',         40.7250,  -73.5140, 'levitt',        'pin' ],
  [48, 'Thomas Gilcrease House',         'Tulsa',           'OK', 'Midwest',   '1913',         36.1780,  -95.9970, 'craftsman',     'pin' ],
  [49, 'Eichler Homes',                  'Palo Alto',       'CA', 'West',      'c. 1949–1974', 37.4419, -122.1430, 'eichler',       'dist'],
  [50, "Muddy Waters' House",            'Chicago',         'IL', 'Midwest',   '1891',         41.8158,  -87.5949, 'twoflat',       'pin' ],
  [51, 'Daisy and L.C. Bates Home',      'Little Rock',     'AR', 'South',     '1950',         34.7440,  -92.2600, 'ranch',         'pin' ],
  [52, 'William and Daisy Myers Home',   'Levittown',       'PA', 'Northeast', '1952',         40.1090,  -74.8530, 'levitt',        'pin' ],
  [53, 'Irwin and Xenia Miller House',   'Columbus',        'IN', 'Midwest',   '1957',         39.2100,  -85.9210, 'modernist',     'pin' ],
  [54, 'Hemingway House',                'Ketchum',         'ID', 'West',      '1953',         43.6900, -114.3600, 'modernist',     'pin' ],
  [55, 'Fats Domino House',              'New Orleans',     'LA', 'South',     'c. 1950s',     29.9660,  -90.0180, 'shotgun',       'pin' ],
  [56, 'Frank Gehry Residence',          'Santa Monica',    'CA', 'West',      '1978',         34.0290, -118.4930, 'gehry',         'pin' ],
  [57, 'The Katrina Cottage',            'Ocean Springs',   'MS', 'South',     '2006',         30.4113,  -88.8281, 'cottage',       'pin' ],
  [58, 'Karuna House',                   'Newberg',         'OR', 'West',      '2013',         45.3001, -122.9730, 'passivhaus',    'pin' ],
  [59, 'Tim Shea Home',                  'Austin',          'TX', 'South',     '2020',         30.2470,  -97.6800, 'printed',       'pin' ],
  [60, "Christina Koch's Home",          'Aboard the ISS',  '—',  'Orbit',     '2019',         null,     null,     'orbital',       'off' ],
];

export const POI = RAW.map(r => {
  const year = yearOf(r[5]);
  return {
    ref: r[0], name: r[1], city: r[2], state: r[3], region: r[4],
    date: r[5], lat: r[6], lon: r[7], archetype: r[8], mode: r[9],
    year, era: eraOf(year),
    tags: r[4] === 'Orbit' ? ['Orbit', r[2]] : [r[4], r[3], r[2]],
    body: LOREM,
  };
}).sort((a, b) => a.year - b.year);

// counts per era, for the timeline segments
export const ERA_COUNTS = ERAS.reduce((m, e) => {
  m[e.id] = POI.filter(p => p.era === e.id).length;
  return m;
}, {});
