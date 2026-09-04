// Interactive Map of American Historic Homes — 40 map entries.
// Drawn from the v2 compliance source list. Coordinates are city/site level;
// swap in surveyed lat/lon where street-level precision matters.
// Non-point entries (Shaker Communities, Sears kit homes, Eichler homes,
// Christina Koch aboard the ISS) and the two outside the lower 48
// (Iolani Palace, Oscar Anderson House) are omitted per brief.

export const LOREM = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent enim ad minim.';

// [ref, name, city, state, region, date, lat, lon, archetype]
const RAW = [
  [ 1, 'Taos Pueblo',                    'Taos',            'NM', 'West',      'c. 1000–1450', 36.4390, -105.5450, 'pueblo'],
  [ 2, 'Paul Revere House',              'Boston',          'MA', 'Northeast', '1680',         42.3638,  -71.0537, 'colonial'],
  [ 3, 'Betsy Ross Home',                'Philadelphia',    'PA', 'Northeast', 'c. 1740',      39.95224, -75.14464, 'rowhouse'],
  [ 4, 'Monticello',                     'Charlottesville', 'VA', 'South',     '1772',         38.0087,  -78.4534, 'neoclassical'],
  [ 5, 'Drayton Hall',                   'Charleston',      'SC', 'South',     '1738',         32.8069,  -80.0810, 'plantation'],
  [ 6, 'Jacob Dingee Townhouse',         'Wilmington',      'DE', 'Northeast', 'c. 1770',      39.74156, -75.55079, 'rowhouse'],
  [ 8, 'Ridgely Family Estate',          'Towson',          'MD', 'Northeast', '1790',         39.4167,  -76.5875, 'plantation'],
  [ 9, 'Abraham Lincoln Home',           'Springfield',     'IL', 'Midwest',   '1839',         39.7975,  -89.6478, 'colonial'],
  [10, 'La Casa Cordova',                'Tucson',          'AZ', 'West',      'c. 1848',      32.2226, -110.9747, 'adobe'],
  [11, 'Brigham Young Home',             'Salt Lake City',  'UT', 'West',      '1854',         40.7702, -111.8880, 'colonial'],
  [12, 'Hay House',                      'Macon',           'GA', 'South',     '1859',         32.8354,  -83.6320, 'italianate'],
  [13, 'Grant-Kohrs Ranch',              'Deer Lodge',      'MT', 'West',      '1862',         46.4060, -112.7480, 'ranch'],
  [14, 'Booker T. Washington Home',      'Malden',          'WV', 'South',     'c. 1865',      38.3390,  -81.5060, 'cabin'],
  [16, 'Mark Twain House',               'Hartford',        'CT', 'Northeast', '1874',         41.7670,  -72.7010, 'stick'],
  [17, 'Coolidge Homestead',             'Plymouth Notch',  'VT', 'Northeast', '1840',         43.5450,  -72.7180, 'farmhouse'],
  [18, 'Frederick Douglass Home',        'Washington',      'DC', 'Northeast', '1855',         38.86333, -76.98528, 'italianate'],
  [19, 'Willa Cather Childhood Home',    'Red Cloud',       'NE', 'Midwest',   'c. 1878',      40.0890,  -98.5190, 'farmhouse'],
  [20, 'Thomas Edison Home',             'West Orange',     'NJ', 'Northeast', '1880',         40.7870,  -74.2400, 'queenanne'],
  [21, "Alfred Jackson Home",            'The Hermitage',   'TN', 'South',     'c. 1841–43',   36.2150,  -86.6130, 'cabin'],
  [22, 'American Gothic House',          'Eldon',           'IA', 'Midwest',   '1881',         40.9200,  -92.2230, 'gothic'],
  [24, 'Winslow Homer Studio',           "Prout's Neck",    'ME', 'Northeast', '1884',         43.5470,  -70.3230, 'shingle'],
  [25, 'Augustus Saint-Gaudens Home',    'Cornish',         'NH', 'Northeast', 'c. 1817',      43.4970,  -72.3650, 'federal'],
  [26, 'Helen Keller Home',              'Tuscumbia',       'AL', 'South',     '1820',         34.7290,  -87.7020, 'cottage'],
  [27, 'Molly Brown House',              'Denver',          'CO', 'West',      '1889',         39.7373, -104.9800, 'queenanne'],
  [28, 'Ralph Middleton Munroe House',   'Miami',           'FL', 'South',     '1891',         25.7280,  -80.2430, 'bungalow'],
  [29, 'Alva Vanderbilt Home',           'Newport',         'RI', 'Northeast', '1892',         41.46208, -71.30561, 'gilded'],
  [30, 'Biltmore',                       'Asheville',       'NC', 'South',     '1895',         35.5400,  -82.5520, 'chateau'],
  [31, 'Eisenhower Boyhood Home',        'Abilene',         'KS', 'Midwest',   '1887',         38.9200,  -97.2140, 'farmhouse'],
  [32, 'Ludwig and Christina Welk Home', 'Strasburg',       'ND', 'Midwest',   '1898',         46.1300, -100.1600, 'sod'],
  [33, 'Rogarshevsky Home',              'New York',        'NY', 'Northeast', '1863',         40.7188,  -73.9900, 'tenement'],
  [34, 'Glensheen Mansion',              'Duluth',          'MN', 'Midwest',   '1908',         46.8150,  -92.0510, 'jacobean'],
  [35, 'Brown Family Homestead',         'Philip',          'SD', 'Midwest',   '1909',         43.8830, -101.9200, 'sod'],
  [36, 'Frederick C. Robie House',       'Chicago',         'IL', 'Midwest',   '1910',         41.7900,  -87.5960, 'prairie'],
  [37, 'Frank Lloyd Wright Home',        'Spring Green',    'WI', 'Midwest',   '1911',         43.1410,  -90.0700, 'prairie'],
  [38, 'Wright Home',                    'Oakwood',         'OH', 'Midwest',   '1914',         39.7180,  -84.1730, 'colonial'],
  [39, 'Laura Ingalls Wilder Home',      'Mansfield',       'MO', 'Midwest',   '1896',         37.0980,  -92.5900, 'farmhouse'],
  [41, 'Edward Schulmerich House',       'Hillsboro',       'OR', 'West',      '1915',         45.5230, -122.9890, 'colonial'],
  [42, 'Hearst Castle',                  'San Simeon',      'CA', 'West',      '1919',         35.6850, -121.1680, 'mediterranean'],
  [43, 'Meadow Brook Hall',              'Rochester Hills', 'MI', 'Midwest',   '1926',         42.6700,  -83.2050, 'tudor'],
  [45, 'Fred L. Anspaugh Houseboat',     'Seattle',         'WA', 'West',      '1920s',        47.6360, -122.3320, 'houseboat'],
  [46, 'Thunderbird Lodge',              'Lake Tahoe',      'NV', 'West',      '1936',         39.2280, -119.9370, 'lodge'],
  [47, 'Post-WWII Suburb',               'Levittown',       'NY', 'Northeast', '1947',         40.7250,  -73.5140, 'levitt'],
  [48, 'Thomas Gilcrease House',         'Tulsa',           'OK', 'Midwest',   '1913',         36.1780,  -95.9970, 'craftsman'],
  [51, 'Daisy and L.C. Bates Home',      'Little Rock',     'AR', 'South',     '1950',         34.7440,  -92.2600, 'ranch'],
  [53, 'Irwin and Xenia Miller House',   'Columbus',        'IN', 'Midwest',   '1957',         39.2100,  -85.9210, 'modernist'],
  [54, 'Hemingway House',                'Ketchum',         'ID', 'West',      '1953',         43.6900, -114.3600, 'modernist'],
  [55, 'Fats Domino House',              'New Orleans',     'LA', 'South',     'c. 1950s',     29.9660,  -90.0180, 'shotgun'],
  [56, 'Frank Gehry Residence',          'Santa Monica',    'CA', 'West',      '1978',         34.0290, -118.4930, 'gehry'],
  [59, 'Tim Shea Home',                  'Austin',          'TX', 'South',     '2020',         30.2470,  -97.6800, 'printed'],
];

export const POI = RAW.map(r => ({
  ref: r[0], name: r[1], city: r[2], state: r[3], region: r[4],
  date: r[5], lat: r[6], lon: r[7], archetype: r[8],
  tags: [r[4], r[3], r[2]],
  body: LOREM,
})).slice(0, 40);
