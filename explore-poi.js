// Interactive Map of American Historic Homes — 40 map entries.
// Drawn from the v2 compliance source list. Coordinates are city/site level;
// swap in surveyed lat/lon where street-level precision matters.
// Non-point entries (Shaker Communities, Sears kit homes, Eichler homes,
// Christina Koch aboard the ISS) and the two outside the lower 48
// (Iolani Palace, Oscar Anderson House) are omitted per brief.

export const LOREM = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent enim ad minim.';

// Era buckets are unequal in span and roughly equal in count: the dates cluster
// hard in 1840–1920, so equal decade-width segments would leave half the
// timeline empty and pile most homes into three cells.
export const ERAS = [
  { id: 'e01', label: '–1699',     tick: '1000', name: 'Before the Republic', from: -Infinity, to: 1699 },
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
  { id: 'e12', label: '1970–NOW',  tick: '1970', name: 'Modern America',      from: 1970, to: Infinity },
];

// the year an entry sorts by — first four-digit number in its date string
const yearOf = d => {
  const m = String(d).match(/1[0-9]{3}|20[0-9]{2}/);
  return m ? +m[0] : 0;
};
const eraOf = y => (ERAS.find(e => y >= e.from && y <= e.to) || ERAS[0]).id;

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

// Photographs, keyed by entry ref. Sourced and license-cleared per the v2
// compliance image source list; files resized/re-encoded into assets/homes/.
// Entries without a freely licensed publication-quality photo (17, 38, 47, 48, 55)
// keep the placeholder slot.
const IMG = {
  1: 'assets/homes/01_Taos_Pueblo_NM.jpg',
  2: 'assets/homes/02_Paul_Revere_House_Boston_MA.jpg',
  3: 'assets/homes/03_Betsy_Ross_House_Philadelphia_PA.jpg',
  4: 'assets/homes/04_Monticello_VA.jpg',
  5: 'assets/homes/05_Drayton_Hall_Charleston_SC.jpg',
  6: 'assets/homes/06_Jacob_Dingee_House_Wilmington_DE.jpg',
  8: 'assets/homes/08_Hampton_NHS_Ridgely_Estate_Towson_MD.jpg',
  9: 'assets/homes/09_Lincoln_Home_Springfield_IL.jpg',
  10: 'assets/homes/10_La_Casa_Cordova_Tucson_AZ.jpg',
  11: 'assets/homes/11_Beehive_House_Salt_Lake_City_UT.jpg',
  12: 'assets/homes/12_Hay_House_Macon_GA.jpg',
  13: 'assets/homes/13_Grant_Kohrs_Ranch_Main_House_Deer_Lodge_MT.jpg',
  14: 'assets/homes/14_Booker_T_Washington_Malden_WV.jpg',
  16: 'assets/homes/16_Mark_Twain_House_Hartford_CT.jpg',
  18: 'assets/homes/18_Frederick_Douglass_Cedar_Hill_DC.jpg',
  19: 'assets/homes/19_Willa_Cather_Childhood_Home_Red_Cloud_NE.jpg',
  20: 'assets/homes/20_Edison_Glenmont_West_Orange_NJ.jpg',
  21: 'assets/homes/21_Alfreds_Cabin_Hermitage_TN.jpg',
  22: 'assets/homes/22_American_Gothic_House_Eldon_IA.jpg',
  24: 'assets/homes/24_Winslow_Homer_Studio_Prouts_Neck_ME.jpg',
  25: 'assets/homes/25_Saint_Gaudens_Aspet_Cornish_NH.jpg',
  26: 'assets/homes/26_Helen_Keller_Ivy_Green_Tuscumbia_AL.jpg',
  27: 'assets/homes/27_Molly_Brown_House_Denver_CO.jpg',
  28: 'assets/homes/28_The_Barnacle_Miami_FL.jpg',
  29: 'assets/homes/29_Marble_House_Newport_RI.jpg',
  30: 'assets/homes/30_Biltmore_Asheville_NC.jpg',
  31: 'assets/homes/31_Eisenhower_Boyhood_Home_Abilene_KS.jpg',
  32: 'assets/homes/32_Welk_Homestead_Strasburg_ND.jpg',
  33: 'assets/homes/33_97_Orchard_St_Tenement_Museum_NYC.jpg',
  34: 'assets/homes/34_Glensheen_Duluth_MN.jpg',
  35: 'assets/homes/35_Prairie_Homestead_Philip_SD.jpg',
  36: 'assets/homes/36_Robie_House_Chicago_IL.jpg',
  37: 'assets/homes/37_Taliesin_Spring_Green_WI.jpg',
  39: 'assets/homes/39_Rocky_Ridge_Farm_Mansfield_MO.jpg',
  41: 'assets/homes/41_Edward_Schulmerich_House_Hillsboro_OR.jpg',
  42: 'assets/homes/42_Hearst_Castle_San_Simeon_CA.jpg',
  43: 'assets/homes/43_Meadow_Brook_Hall_Rochester_Hills_MI.jpg',
  45: 'assets/homes/45_Houseboat_Lake_Union_Seattle_WA.jpg',
  46: 'assets/homes/46_Thunderbird_Lodge_Lake_Tahoe_NV.jpg',
  51: 'assets/homes/51_Daisy_and_LC_Bates_Home_Little_Rock_AR.jpg',
  53: 'assets/homes/53_Miller_House_Columbus_IN.jpg',
  54: 'assets/homes/54_Hemingway_Ketchum_ID_Memorial.jpg',
  56: 'assets/homes/56_Gehry_Residence_Santa_Monica_CA.jpg',
  59: 'assets/homes/59_3D_Printed_House_Tecla.jpg',
};

// Attribution credit lines from the compliance image source list. Entries with
// req:true carry a license (CC BY / BY-SA / Attribution) whose terms require the
// credit to remain visible to the viewer; the panel renders these under the photo.
const CRED = {
  1: { text: 'Photo: John Mackenzie Burke / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Taos_Pueblo_2017-05-05.jpg', req: true },
  2: { text: 'Photo: Beyond My Ken / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:2017_Paul_Revere_House_from_east.jpg', req: true },
  3: { text: 'Photo: ajay_suresh / Wikimedia Commons, CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Betsy_Ross_House_(53572939795).jpg', req: true },
  4: { text: 'Photo: Moofpocket / Wikimedia Commons, CC BY 2.5', url: 'https://commons.wikimedia.org/wiki/File:Monticello_reflected.JPG', req: true },
  5: { text: 'Photo: Goingstuckey / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Drayton_Hall_2007.jpg', req: true },
  6: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Jacob_Dingee_House.JPG', req: false },
  8: { text: 'Photo: JGHowes (Canon AE-1, Kodachrome) / Wikimedia Commons, Attribution', url: 'https://commons.wikimedia.org/wiki/File:Hampton_Natl_Historic_Site.jpg', req: true },
  9: { text: 'Photo: Daniel Schwen / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Lincoln_Home_1.jpg', req: true },
  10: { text: 'Ammodramus / Wikimedia Commons, CC0', url: 'https://commons.wikimedia.org/wiki/File:Cordova_house_(Tucson,_Arizona)_from_SE_1.JPG', req: false },
  11: { text: 'Beneathtimp / Wikimedia Commons, CC0', url: 'https://commons.wikimedia.org/wiki/File:Beehive_House_-_Salt_Lake_City,_Utah_-_2_May_2020.jpg', req: false },
  12: { text: 'Photo: Bubba73 (Jud McCranie) / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Johnston%E2%80%93Felton%E2%80%93Hay_House,_Macon,_GA,_US.jpg', req: true },
  13: { text: 'Photo: Chris Light / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Main_House_052.jpg', req: true },
  14: { text: 'Photo: Antony-22 / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Malden_Historic_District_2021a.jpg', req: true },
  16: { text: 'Photo: Makemake (German Wikipedia) / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:House_of_Mark_Twain.jpg', req: true },
  18: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Frederick_Douglass_House.jpg', req: false },
  19: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Willa_Cather_house_from_NE_3.JPG', req: false },
  20: { text: 'Photo: P. Hughes / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Glenmont_estate.jpg', req: true },
  21: { text: 'Photo: Antony-22 / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:The_Hermitage_cabins_2022a.jpg', req: true },
  22: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:2007-06-04-Gothic_House.jpg', req: false },
  24: { text: 'Photo: Magicpiano / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:ScarboroughME_WinslowHomerStudio.jpg', req: true },
  25: { text: 'Photo: Ser Amantio di Nicolao / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Saint-Gaudens_National_Historic_Site_-_Aspet_front_from_green.JPG', req: true },
  26: { text: 'Photo: Calstanhope / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Helen_Keller_Birthplace_House_in_Tuscumbia,_Alabama.jpg', req: true },
  27: { text: 'Photo: Self / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Molly_Brown_House.JPG', req: true },
  28: { text: 'Photo: BakedintheHole / Wikimedia Commons, CC BY 4.0', url: 'https://commons.wikimedia.org/wiki/File:The_Barnacle_in_Miami.jpg', req: true },
  29: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Marble_House,_Newport_RI.jpg', req: false },
  30: { text: 'Photo: Blake Lewis / Wikimedia Commons, CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Biltmore_Estate,_2012.jpg', req: true },
  31: { text: 'Staryu / Wikimedia Commons, CC0', url: 'https://commons.wikimedia.org/wiki/File:Eisenhower_Home_in_2026.png', req: false },
  32: { text: 'Photo: Jerrye & Roy Klotz MD / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:LUDWIG_AND_CHRISTINA_WELK_HOMESTEAD.jpg', req: true },
  33: { text: 'Photo: Fletcher6 / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:97_Orchard_Street_Front.jpg', req: true },
  34: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Glensheen.JPG', req: false },
  35: { text: 'Photo: J Hirtle / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Prairie_Homestead_IMG_0067.jpg', req: true },
  36: { text: 'Photo: Teemu08 / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Frederick_C._Robie_House.JPG', req: true },
  37: { text: 'Photo: Warren LeMay / Wikimedia Commons, CC BY-SA 2.0', url: 'https://commons.wikimedia.org/wiki/File:Taliesin_exterior_2024_(54225850259).jpg', req: true },
  39: { text: 'Photo: TimothyMN / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:LauraIngallsWilder-RockyRidgeFarm-MansfieldMO_adjusted.jpg', req: true },
  41: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Edward_Schulmerich_House_2008.JPG', req: false },
  42: { text: 'Photo: King of Hearts / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Hearst_Castle_Casa_Grande_September_2012_panorama_2.jpg', req: true },
  43: { text: 'Photo: Wm. Chris Rowland, II / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Meadowbrook_Hall.JPG', req: true },
  45: { text: 'Photo: Seattle Municipal Archives / Wikimedia Commons, CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Seattle_-_Houseboats_on_Lake_Union,_circa_1970s_(36910759450).jpg', req: true },
  46: { text: 'Photo: Blake Everett Carroll / Wikimedia Commons, CC BY-SA 4.0', url: 'https://commons.wikimedia.org/wiki/File:Thunderbird_Lodge,_Lake_Tahoe,_Nevada,_20220905,_03.jpg', req: true },
  51: { text: 'Photo: Valis55 / Wikimedia Commons, CC BY-SA 3.0', url: 'https://commons.wikimedia.org/wiki/File:Daisy_Bates_House.JPG', req: true },
  53: { text: 'Public domain via Wikimedia Commons', url: 'https://commons.wikimedia.org/wiki/File:Miller_House_in_Columbus.jpg', req: false },
  54: { text: 'Photo: altiemae / Wikimedia Commons, CC BY 2.0', url: 'https://commons.wikimedia.org/wiki/File:Hemingway_Memorial_Sun_Valley.jpg', req: true },
  56: { text: "Photo: IK's World Trip / Wikimedia Commons, CC BY 2.0", url: 'https://commons.wikimedia.org/wiki/File:Gehry_House_-_Image01.jpg', req: true },
  59: { text: 'Photo: WASP / Mario Cucinella Architects / Wikimedia Commons, CC BY 2.5', url: 'https://commons.wikimedia.org/wiki/File:Eco-sustainable_3D_printed_house_%22Tecla%22.jpg', req: true },
};

// Where the available photo is a documented stand-in rather than the exact home,
// the compliance list flagged it REPRESENTATIVE/SUBSTITUTE — surfaced as a caption
// note so the image isn't read as the specific dwelling.
const NOTE = {
  14: 'Substitute: Malden Historic District streetscape — the boyhood home itself is a modern reconstruction.',
  21: "Alfred's Cabin is one of the Hermitage slave-quarters cabins shown here.",
  45: 'Representative: Lake Union houseboats, c. 1970s — no free photo of the Anspaugh houseboat exists.',
  54: 'Substitute: Hemingway Memorial, Sun Valley — the Ketchum house is privately stewarded with no free photo.',
  59: "Substitute: the 'Tecla' 3D-printed house — no free photo of the Austin unit exists.",
};

// Body copy for each entry, from the V3 landing-page copy document
// (MAR033_Landing_Page_History_Copy_v3). Keyed by entry ref.
const BODY = {
  1: "A multi-story adobe apartment complex built by Ancestral Puebloan descendants has been continuously inhabited for over 1,000 years, making it one of the oldest continuously occupied communities in the United States. Its thick mud-and-straw walls and communal structure stand in direct contrast to the single-family home that would later come to define American housing.",
  2: "The Paul Revere House is built in Boston’s North End. Revere, a silversmith and Patriot messenger, purchased the modest wooden structure in 1770 and raised his large family there. The home features signature late-17th-century architectural elements like steep gabled roofs, heavy framing posts, overhanging jetties, and a large central chimney bay. It's the oldest building still standing in downtown Boston.",
  3: "An upholsterer and seamstress, Ross is thought to have run her trade out of a narrow brick row house at 239 Arch Street in Philadelphia. The two-and-a-half-story home is small and vertical with a narrow street-facing room where Ross conducted business, cramped upper floors for sleeping, and a rear section added around 1750 or 1760. It’s one of the best-preserved examples of ordinary urban colonial-era housing.",
  4: "Thomas Jefferson designs and continually rebuilds Monticello, his Neoclassical plantation home in Charlottesville, Virginia, modeling it on Palladian architecture he admired in Europe. The estate was built and maintained by more than 400 enslaved people over Jefferson's lifetime.",
  5: "Built for John Drayton, this is the oldest preserved plantation house in America open to the public. Unusually, it was never modernized with electricity, plumbing, or central heating by the family that owned it for seven generations, making it one of the only Colonial-era great houses that survives essentially unaltered rather than restored to a guessed-at appearance.",
  6: "Joiner and carpenter Jacob Dingee built this two-story brick house using the ground-floor front room as his workshop. It is one of the few surviving dwellings from Wilmington's early Quaker settlement period and represents an ordinary working-family home, continuously occupied over generations by craftspeople—later a bricklayer, an ironmonger, and a contractor-builder. Built with Flemish bond brickwork and black-glazed headers, it was listed on the National Register in 1970 and moved to Willingtown Square in 1976.",
  7: "The United Society of Believers (Shakers) founded some of their first American communities in the 1780s–90s in New York and New England, building large communal \"dwelling houses\" where unrelated men and women lived, worked, and worshipped together, a radical departure from the nuclear-family household. The architectural style was also visually striking—spare, symmetrical, and utterly unornamented interiors.",
  8: "Built for the Ridgely family, ironmasters and later governors of Maryland, Hampton was, for a time, the largest private home in the newly formed U.S. The estate—main house, formal gardens, and surviving enslaved-worker quarters—was expanded through the 1830s and was the first site selected for preservation by the National Park Service. It is one of the finest examples of Georgian architecture in the country, and the gardens have been restored to resemble their appearance in the 1820s.",
  9: "Abraham Lincoln was born in a one-room log cabin on Sinking Spring Farm. He later lived in an even smaller cabin at Knob Creek. The only home Lincoln ever owned outright was a modest Greek Revival house in Springfield, Illinois, purchased in 1844 for $1,500, a study in contrast to the log cabin of his birth.",
  10: "Built during Tucson's Mexican Territory period, this Sonoran row house is thought to be the oldest surviving structure in downtown Tucson. Its adobe walls run two feet thick, its street-facing facade has almost no windows, and its interior courtyard, once holding a well, an outdoor cooking stove, and a shade ramada, provided light and airflow shielded from direct desert sun. The common design across Sonora and Spanish/Mexican-era Tucson kept interiors measurably cooler than the punishing heat outside without any mechanical cooling at all. Named for Maria Navarette Cordova, whose family lived there and ran a smoke shop from its front rooms from the 1930s to 1973, it's now preserved by the Tucson Museum of Art.",
  11: "Brigham Young, president of the Church of Jesus Christ of Latter-day Saints and Utah's first territorial governor, built this as his official residence, topped with a wooden beehive sculpture symbolizing industriousness—a symbol that remains on Utah's state seal today. It's one of the most recognizable historic homes in the Mountain West and is open for free public tours.",
  12: "Merchant William Butler Johnston built this opulent 18,000-square-foot mansion after a two-year honeymoon touring Italy, importing the era's newest technology— indoor plumbing, a servant call system, natural gas lighting, and even a rudimentary ventilation system—well ahead of most American homes. Locally nicknamed \"the Palace of the South,\" it's now a National Historic Landmark museum.",
  13: "Conrad Kohrs, a German immigrant who built one of the largest cattle operations in the Northern Plains, expanded a simple log ranch house into a substantial Victorian-era ranch home as his fortune grew. The house was completed in 1890 and is now a National Historic Site run by the National Park Service, with the working ranch buildings around it intact—a rare complete picture of the cattle-ranching version of the American homestead story.",
  14: "At nine, Booker T. Washington, who would become a successful orator, educator, and author, walked 225 miles from Virginia to Malden, West Virginia, to join the stepfather who'd found work there after emancipation. He spent his boyhood laboring in a salt furnace and coal mine while teaching himself to read. The original frame cabin was lost decades ago, but in 1998 the community rebuilt it from period photographs, siting it behind the African Zion Baptist Church, the oldest Black Baptist congregation in the state, where Washington himself worshipped as a boy.",
  15: "For centuries, Lakota and other Plains nations lived in tipis—portable, buffalo-hide (later canvas) dwellings built for a mobile life following bison herds across the Great Plains. The 1868 Treaty of Fort Laramie set aside the Great Sioux Reservation, including the sacred Black Hills, for the Lakota, Dakota, Nakota, and Arapaho, but when gold was discovered there in 1874, the U.S. broke the treaty and let prospectors flood in. After the Lakota's last major victory at the Battle of the Little Bighorn in 1876, the U.S. Army forced Plains nations onto reservations, ending a way of life built around the tipi in favor of fixed government housing.",
  16: "Samuel Clemens designed this eccentric, turreted 25-room mansion with the help of architect Edward Tuckerman Potter, filling it with Tiffany-designed interiors and a semi-circular porch he called his \"steamboat deck.\" He wrote “The Adventures of Huckleberry Finn” and several other major works at a desk here. It's one of the most visually distinctive literary homes in the country and is now a National Historic Landmark.",
  17: "John Coolidge, a farmer and local storekeeper, expanded this one-and-a-half-story farmhouse for his growing family, including his son, Calvin. Decades later, on the night of August 2, 1923, Vice President Coolidge was vacationing at the family home when word arrived that President Warren Harding had died suddenly. With no federal official available at that hour, Coolidge's own father, a notary public, administered the presidential oath of office by kerosene lamp in the family's sitting room, making this modest farmhouse parlor the site of a U.S. presidential inauguration. It remains furnished exactly as it was that night.",
  18: "Frederick Douglass, born enslaved, purchased Cedar Hill, a 21-room brick Victorian home overlooking the Anacostia River and the U.S. Capitol in Washington, D.C. Douglass moved there in 1877 as a free man, an abolitionist leader, and a U.S. government official.",
  19: "Novelist Willa Cather grew up in this small frame house after her family moved from Virginia to the Nebraska prairie, an experience that became the foundation for her Pulitzer Prize-winning novels about pioneer life, including “My Antonia” and “O Pioneers!” It's preserved today by the National Willa Cather Center as a National Historic Landmark.",
  20: "Thomas Edison bought this 29-room mansion soon after marrying his second wife, Mina, and lived there while running his nearby invention laboratory, the site where he developed the motion picture camera and improved the phonograph. It's preserved by the National Park Service as part of Edison National Historical Park.",
  21: "Alfred Jackson was born enslaved at The Hermitage, Andrew Jackson's plantation near Nashville, Tennessee, and worked as the estate's wagoner and stableman. After emancipation, he stayed on as a tenant farmer and, by the 1880s, moved into the log dwelling now known as Alfred's Cabin, where he lived until his death in 1901. The cabin still stands today as one of the best-documented surviving examples of enslaved and post-emancipation housing in the country.",
  22: "Civil War veteran and livery stable owner Charles Dibble and his wife, Catherine, built this modest 504-sq.-ft. farmhouse for themselves and their eight children, adding two ornate pointed \"Gothic\" windows, likely ordered from a Sears catalog, to an otherwise plain wood-frame house. In 1930, painter Grant Wood drove through Eldon, spotted the incongruous window against the plain farmhouse, and sketched it on the spot; the resulting painting, American Gothic, became one of the most recognized images in American art. The house stands on its original site, now preserved by the State Historical Society of Iowa.",
  23: "King Kalākaua built Iolani Palace as the official residence of the Hawaiian monarchy—the only royal palace on U.S. soil—outfitting it with electric lighting and telephones before the White House had either. His sister, Queen Lili'uokalani, lived there as the reigning monarch until she was overthrown in 1893.",
  24: "Painter Winslow Homer converted a carriage house on the rocky Maine coast into his home and studio, living there for the last quarter-century of his life and painting many of his most famous seascapes just steps from his door. It's maintained today by the Portland Museum of Art as a National Historic Landmark.",
  25: "Sculptor Augustus Saint-Gaudens, one of the most celebrated American artists of the Gilded Age, began renting this former inn (built decades earlier, c. 1817) in 1885, later purchasing it and converting it into his home and studio, filling the grounds with his own sculptures and formal gardens. It's now a National Historical Park.",
  26: "Helen Keller was born in this modest white clapboard cottage, and it was here, at the water pump out back, that teacher Anne Sullivan famously broke through to seven-year-old Helen with the word \"water.\" The home remains largely as it was, run today as a museum by the Helen Keller Foundation.",
  27: "Margaret \"Molly\" Brown, who survived the sinking of the Titanic in 1912 and became a celebrated philanthropist and women's rights advocate, bought this elaborate Victorian sandstone house with her husband after he struck gold in Leadville. Now a museum, it tells a rags-to-riches Colorado mining story with an unusually independent, outspoken woman at its center.",
  28: "Ralph Middleton Munroe, a yacht designer and the first commodore of the Biscayne Bay Yacht Club, built his own home using shipwreck timber and Caribbean construction principles rather than conventional American design—setting the house on stilts to maximize airflow and shed floodwater, and adding an open central room with a ventilated cupola so hot air could escape upward. The home survived the catastrophic 1926 Miami hurricane with only minor damage and stood again through Hurricane Andrew in 1992 and Hurricane Irma in 2017. It remains the oldest house in Miami-Dade County still standing on its original site, now preserved as a state park with much of the Munroe family's original furnishings intact.",
  29: "Alva Vanderbilt commissioned this marble-clad \"summer cottage\" from architect Richard Morris Hunt, modeled in part on the Petit Trianon at Versailles. After her divorce and remarriage, Alva became a committed suffragist, hosting a widely covered 1909 suffrage rally and a major 1914 women's suffrage conference on the property, turning the same mansion built to display Gilded Age wealth into a platform for women's rights.",
  30: "George Vanderbilt II, whose family amassed a huge fortune through steamboats, railroads, and other business enterprises, commissions the construction of the Biltmore Estate in Asheville, N.C. With 175,000 square feet, including 35 bedrooms and 65 fireplaces, it remains the largest privately owned home in the US, and one of the most prominent examples of Gilded Age wealth.",
  31: "Dwight D. Eisenhower's family bought this modest two-story frame house when he was eight years old, and he lived there through high school before West Point and a career that led to the presidency. Its plainness is the point—it's maintained today by the Eisenhower Presidential Library exactly as a middle-class Kansas home of the era would have looked.",
  32: "Ludwig and Christina Welk emigrated from the Odessa region (present-day Ukraine) in 1893, part of a wave of nearly 120,000 Germans from Russia who settled in south-central North Dakota for its cheap land. They built this farmhouse from batsa—sun-dried mud brick, the same construction method their community had used on the Russian steppe—with a main floor under 600 square feet. Their son Lawrence, born in the house, later became one of America's most successful bandleaders and television personalities, crediting the values of this modest immigrant farm for his entire career. It's now preserved as a State Historic Site, one of the only surviving sod/batsa houses in North Dakota.",
  33: "Abraham and Fannie Rogarshevsky arrived from Lithuania and, by 1908, had moved into a three-room apartment at 97 Orchard Street, with their six children, squeezing the family into two sleeping areas each night. Abraham found steady work as a presser in a garment shop. Their home, now part of the Tenement Museum, sat within the same building where the German-Jewish Gumpertz family had lived in the 1870s, and the Sicilian Baldizzi family would live in the 1930s—one address holding the story of immigrant housing in New York across more than half a century.",
  34: "Chester Congdon, who made his fortune in Minnesota's iron and timber industries, built this 39-room mansion overlooking Lake Superior. It remains one of the best-preserved Gilded Age estates in the Midwest and is now owned by the University of Minnesota Duluth and open for public tours.",
  35: "Ed and Alice Brown packed everything they owned into a covered wagon and left Nebraska in 1909 to claim 160 acres of Badlands prairie under the Homestead Act. With almost no timber available, they dug their home partway into the earth and built its walls from cut sod, using native cottonwood for the roof beams. It's one of the last original sod homes still standing in South Dakota, preserved with much of its original furnishings intact.",
  36: "Frank Lloyd Wright designed the Robie House for businessman Frederick C. Robie as the culmination of the Prairie School, an architectural style Wright pioneered that broke sharply from Victorian tradition, favoring low, horizontal rooflines, open floor plans, and deep cantilevered eaves meant to echo the flat expanse of the American Midwest. Wright treated every element—furniture, art glass, ornament, structure—as part of a single unified design, rather than separate rooms filled with separate decisions. It became the last of his true Prairie houses before he moved on to new architectural ideas and is now a National Historic Landmark and UNESCO World Heritage Site.",
  37: "Frank Lloyd Wright built his primary home and studio on land his family had farmed for generations, rebuilding it twice after devastating fires, including one in 1914 tied to a shocking act of violence in which several household members were killed. Wright kept living and working there for the rest of his career regardless.",
  38: "Orville and Wilbur Wright built this substantial family home for their father and sister using money from their aviation success, a striking contrast to the modest bicycle-shop-adjacent house where they'd grown up and first began experimenting with flight. It's preserved today and open for limited public tours through Dayton History.",
  39: "Laura Ingalls Wilder and her husband Almanzo designed and built this farmhouse themselves over many years, including custom-built low counters and cabinets sized to Laura's small stature, a genuinely personal architectural detail. She wrote the “Little House” book series at a desk here decades later. It's now a museum run by a nonprofit foundation.",
  40: "Swedish immigrant Oscar Anderson, a butcher and one of Anchorage's first residents, built one of the city's very first wood-frame houses just as the tent-and-railroad camp of Anchorage was becoming a permanent town. It's now a house museum run by the Municipality of Anchorage.",
  41: "Edward Schulmerich, a banker and later Oregon state senator, built this two-story Craftsman home on Main Street after co-founding the Hillsboro Commercial Bank and constructing its downtown building a few years earlier. Classified specifically as an \"Airplane Bungalow\"—a Craftsman subtype with a small second-story room set back from the roofline, resembling a cockpit atop a fuselage—the house retains much of its original interior finishing, including built-in cabinetry and period linoleum. It's listed on the National Register of Historic Places.",
  42: "Newspaper magnate William Randolph Hearst commissioned architect Julia Morgan, the first woman licensed to practice architecture in California, to build his family's hilltop ranch. What began as a modest bungalow grew into a 165-room estate, combining Mediterranean, Spanish Colonial, and Gothic Revival influences, and was filled with Hearst's vast collection of European antiques and art. Construction continued almost without pause until 1939, paused during World War II, and resumed until Hearst's final departure in 1947. The estate, formerly known as La Cuesta Encantada, \"The Enchanted Hill,\" remains one of the most lavish private residences ever built in the U.S.",
  43: "Matilda Dodge Wilson, widow of automobile pioneer John Dodge and one of the wealthiest women in America at the time, built this 88,000-square-foot Tudor Revival mansion, one of the largest homes in the U.S., after remarrying. She later donated the estate to found what became Oakland University.",
  44: "At the height of the Sears Modern Homes kit program, sales topped $12 million in a single year, the peak of a catalog business that let ordinary families order a complete house, shipped by rail in pieces, and assemble it themselves. Just months later, the stock market crash and the Great Depression sent many Sears-financed mortgage holders into default, marking a sharp turn for a program built on expanding homeownership. Original Sears kit homes still stand in nearly every state.",
  45: "Fred L. Anspaugh built his own floating home on Lake Union's Roanoke dock in the early 1930s and lived there for decades. In June 1961, when King County moved to clear houseboats along the lake to make way for the new Evergreen Point Floating Bridge and the I-5 approach, eviction notices were sent to dozens of owners. But Anspaugh, then 80 years old, refused to leave the home he'd built with his own hands, drawing wide local attention for his stand.",
  46: "Eccentric millionaire George Whittell Jr. built this stone-and-timber lodge directly into the Lake Tahoe shoreline, complete with a hidden boathouse and tunnels connecting the main house to a card house and a lighthouse-style structure. Whittell reportedly kept a pet lion cub on the property at one point. It's now preserved by a nonprofit and open for seasonal tours.",
  47: "William Levitt breaks ground on Levittown, New York, mass-producing Cape Cod-style houses (roughly 750 square feet, no basement) at a rate of one every 16 minutes, using a 27-step assembly-line construction process. It becomes the prototype for postwar American suburbia and homeownership for returning veterans.",
  48: "In 1899, at age nine, Thomas Gilcrease’s one-eighth Creek heritage entitled him to a 160-acre federal land allotment, land that turned out to sit atop one of the richest strikes in American history. Gilcrease became an oil executive and later purchased this modest sandstone house, built in 1913, moving in and opening a museum on the adjoining property in 1949. He used his fortune to build one of the world's largest collections of American Western and Native American art and artifacts, including the only surviving certified copy of the Declaration of Independence. He later deeded the entire estate, collection, and home to the City of Tulsa.",
  49: "Joseph Eichler, an accountant with no architectural training, built his first tract in Sunnyvale in 1949 after living in a Frank Lloyd Wright-designed rental convinced him that good modern design shouldn't be reserved for the wealthy. Partnering over the years with architects including Anshen & Allen and A. Quincy Jones, Eichler Homes went on to build roughly 11,000 houses defined by post-and-beam construction, floor-to-ceiling glass walls, private interior atriums, and radiant floor heating, bringing genuinely modernist architecture to middle-class families at scale. Eichler was also unusually progressive for his era, selling openly to Black and other minority buyers well before fair housing laws required it. His developments remain concentrated in Sunnyvale, Palo Alto, and across the Bay Area, several of which are now protected as National Register historic districts.",
  50: "McKinley Morganfield, “Muddy Waters,” bought a modest 1891 brick two-flat on Chicago's South Side after leaving Mississippi as part of the Great Migration. It became far more than a residence: musicians gathered in his basement for jam sessions that helped invent the amplified, urbanized \"Chicago blues\" sound. Here, Waters wrote and recorded some of his biggest hits. Now run by his great-granddaughter as the Muddy Waters MOJO Museum, the house is both a Chicago Landmark and a National Register of Historic Places listing.",
  51: "Daisy Bates, president of the Arkansas NAACP, and her husband, L.C., built this ordinary brick ranch house in 1955. Two years later, it became the de facto command post of the Little Rock Nine's desegregation of Central High School, the daily meeting point where the students gathered each morning and returned each afternoon under threat of violence. It is a National Historic Landmark.",
  52: "William and Daisy Myers, an Army Veteran and schoolteacher, became the first Black family to integrate the previously all-white planned suburb of Levittown, Pennsylvania. After purchasing the home at 43 Deepgreen Lane in Bristol Township, they faced violent, months-long protests and harassment. Daisy Myers became known as \"the Rosa Parks of the North,\" and the couple’s home serves as a landmark of civil rights history.",
  53: "Industrialist J. Irwin Miller and his wife Xenia commissioned architect Eero Saarinen, alongside landscape architect Dan Kiley and designer Alexander Girard, to build a low, glass-walled home organized around a sunken conversation pit, one of the first ever built. The Millers lived in it for the rest of their lives, filling it with the era's finest furniture design, and it became a touchstone for a broader civic experiment: the Millers spent decades convincing other town leaders in Columbus to commission major architects for schools, churches, and civic buildings, turning their Indiana city into an architectural destination.",
  54: "Ernest Hemingway bought this concrete-and-wood home in the mountains outside Sun Valley for the hunting and fishing, and lived there for the last two years of his life. It remains privately held by a conservation partnership but is a National Historic Landmark with public exterior viewing and extensive photography from his estate and biographers.",
  55: "Rock 'n' roll pioneer Antoine \"Fats\" Domino built his pink-and-white house on Caffin Avenue in the early 1960s, in the same working-class Lower Ninth Ward neighborhood where he'd been born, one of New Orleans' first subdivisions where Black families could own property outright. He installed a home recording studio and stayed for decades, a visible symbol that success didn't have to mean leaving the community that raised him. When Hurricane Katrina flooded the Ninth Ward in 2005, Domino refused to evacuate and had to be rescued by boat; rumors of his death briefly spread nationwide before he was found safe. The Tipitina's Foundation later helped fund the home's restoration, and Domino moved back in, a homecoming widely seen as a hopeful sign for the whole neighborhood's recovery.",
  56: "Gehry bought an unremarkable pink bungalow for his family and wrapped it in raw plywood, corrugated metal, and chain-link fencing, exposing studs and framing rather than hiding them—a radical, controversial renovation of his own home that he used to publicly test the ideas that would define his career. Neighbors were reportedly unhappy for years; it's now considered one of the most influential residential works of the late 20th century.",
  57: "Designed by architect Marianne Cusato at the Mississippi Renewal Forum just months after Hurricane Katrina devastated the Gulf Coast, the 308-square-foot Katrina Cottage was created as a dignified, storm-worthy alternative to the FEMA trailer. The cottage is small, front-porched, and built to resemble the coastal vernacular homes it was replacing. It won the Cooper-Hewitt's inaugural People's Design Award and was later licensed to Lowe's as a nationwide kit-home program. Mississippi ultimately delivered roughly 2,800 cottages to families who'd lost their homes.",
  58: "Designed by Holst Architecture and built by Hammer & Hand, Karuna House became the first building in the world to simultaneously earn Passive House (PHIUS+), Minergie-P-ECO, and LEED for Homes Platinum certification, three of the most demanding green-building standards, combined in a single home. It's an airtight, super-insulated envelope that cuts heating and cooling energy use by roughly 90% compared to a code-built house, with the remaining need met by a small rooftop solar array that generates more power than the home uses annually.",
  59: "Tim Shea, then 70 and formerly homeless with a history of addiction, became the first person in the U.S. to move into a permitted 3D-printed home—a 400-square-foot house built by the construction-tech company ICON as part of a village designed to house Austin's chronically homeless population with dignity and permanence rather than temporary shelter. Shea lived there until his death in early 2026, and his neighbors at Community First! have kept his memory alive with a hand-painted portrait in the community's memorial garden, a home that became, for him, a genuine second chance.",
  60: "NASA astronaut Christina Koch spent 328 consecutive days aboard the International Space Station, the longest single spaceflight ever recorded by a woman, living in a small personal sleep pod, eating rehydrated meals, and running a strict daily exercise routine to counter bone and muscle loss in microgravity. Koch's extended mission marks how far the definition of \"home\" has stretched since Bill Shepherd first moved into the ISS in 2000, a dwelling with no ground beneath it at all.",
};

export const POI = RAW.map(r => {
  const year = yearOf(r[5]);
  const ref = r[0];
  return {
    ref, name: r[1], city: r[2], state: r[3], region: r[4],
    date: r[5], lat: r[6], lon: r[7], archetype: r[8],
    year, era: eraOf(year), mode: 'pin',
    tags: [r[4], r[3], r[2]],
    body: BODY[ref] || LOREM,
    img: IMG[ref] || null,
    credit: CRED[ref] || null,
    note: NOTE[ref] || null,
  };
}).slice(0, 40);

// counts per era, for the timeline segments (over the mapped 40 entries)
export const ERA_COUNTS = ERAS.reduce((m, e) => {
  m[e.id] = POI.filter(p => p.era === e.id).length;
  return m;
}, {});
