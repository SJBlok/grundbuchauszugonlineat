// Auswahl der häufigsten österreichischen Katastralgemeinden
// Vollständige Liste: ca. 2.400 KGs in Österreich
export interface Katastralgemeinde {
  kg: string; // KG-Nummer
  name: string;
  bezirk: string;
  bundesland: string;
}

export const katastralgemeinden: Katastralgemeinde[] = [
  // Wien
  { kg: "01001", name: "Innere Stadt", bezirk: "Wien 1", bundesland: "Wien" },
  { kg: "01002", name: "Leopoldstadt", bezirk: "Wien 2", bundesland: "Wien" },
  { kg: "01003", name: "Landstraße", bezirk: "Wien 3", bundesland: "Wien" },
  { kg: "01004", name: "Wieden", bezirk: "Wien 4", bundesland: "Wien" },
  { kg: "01005", name: "Margareten", bezirk: "Wien 5", bundesland: "Wien" },
  { kg: "01006", name: "Mariahilf", bezirk: "Wien 6", bundesland: "Wien" },
  { kg: "01007", name: "Neubau", bezirk: "Wien 7", bundesland: "Wien" },
  { kg: "01008", name: "Josefstadt", bezirk: "Wien 8", bundesland: "Wien" },
  { kg: "01009", name: "Alsergrund", bezirk: "Wien 9", bundesland: "Wien" },
  { kg: "01010", name: "Favoriten", bezirk: "Wien 10", bundesland: "Wien" },
  { kg: "01011", name: "Simmering", bezirk: "Wien 11", bundesland: "Wien" },
  { kg: "01012", name: "Meidling", bezirk: "Wien 12", bundesland: "Wien" },
  { kg: "01013", name: "Hietzing", bezirk: "Wien 13", bundesland: "Wien" },
  { kg: "01014", name: "Penzing", bezirk: "Wien 14", bundesland: "Wien" },
  { kg: "01015", name: "Rudolfsheim-Fünfhaus", bezirk: "Wien 15", bundesland: "Wien" },
  { kg: "01016", name: "Ottakring", bezirk: "Wien 16", bundesland: "Wien" },
  { kg: "01017", name: "Hernals", bezirk: "Wien 17", bundesland: "Wien" },
  { kg: "01018", name: "Währing", bezirk: "Wien 18", bundesland: "Wien" },
  { kg: "01019", name: "Döbling", bezirk: "Wien 19", bundesland: "Wien" },
  { kg: "01020", name: "Brigittenau", bezirk: "Wien 20", bundesland: "Wien" },
  { kg: "01021", name: "Floridsdorf", bezirk: "Wien 21", bundesland: "Wien" },
  { kg: "01022", name: "Donaustadt", bezirk: "Wien 22", bundesland: "Wien" },
  { kg: "01023", name: "Liesing", bezirk: "Wien 23", bundesland: "Wien" },
  
  // Niederösterreich - Größere Städte
  { kg: "02001", name: "St. Pölten", bezirk: "St. Pölten Stadt", bundesland: "Niederösterreich" },
  { kg: "02101", name: "Wiener Neustadt", bezirk: "Wiener Neustadt Stadt", bundesland: "Niederösterreich" },
  { kg: "02201", name: "Krems an der Donau", bezirk: "Krems an der Donau", bundesland: "Niederösterreich" },
  { kg: "02301", name: "Amstetten", bezirk: "Amstetten", bundesland: "Niederösterreich" },
  { kg: "02401", name: "Baden", bezirk: "Baden", bundesland: "Niederösterreich" },
  { kg: "02501", name: "Mödling", bezirk: "Mödling", bundesland: "Niederösterreich" },
  { kg: "02601", name: "Klosterneuburg", bezirk: "Tulln", bundesland: "Niederösterreich" },
  { kg: "02701", name: "Schwechat", bezirk: "Bruck an der Leitha", bundesland: "Niederösterreich" },
  { kg: "02801", name: "Tulln an der Donau", bezirk: "Tulln", bundesland: "Niederösterreich" },
  { kg: "02901", name: "Korneuburg", bezirk: "Korneuburg", bundesland: "Niederösterreich" },
  { kg: "03001", name: "Stockerau", bezirk: "Korneuburg", bundesland: "Niederösterreich" },
  { kg: "03101", name: "Hollabrunn", bezirk: "Hollabrunn", bundesland: "Niederösterreich" },
  { kg: "03201", name: "Mistelbach", bezirk: "Mistelbach", bundesland: "Niederösterreich" },
  { kg: "03301", name: "Gänserndorf", bezirk: "Gänserndorf", bundesland: "Niederösterreich" },
  { kg: "03401", name: "Bruck an der Leitha", bezirk: "Bruck an der Leitha", bundesland: "Niederösterreich" },
  
  // Oberösterreich
  { kg: "04001", name: "Linz", bezirk: "Linz Stadt", bundesland: "Oberösterreich" },
  { kg: "04101", name: "Wels", bezirk: "Wels Stadt", bundesland: "Oberösterreich" },
  { kg: "04201", name: "Steyr", bezirk: "Steyr Stadt", bundesland: "Oberösterreich" },
  { kg: "04301", name: "Leonding", bezirk: "Linz-Land", bundesland: "Oberösterreich" },
  { kg: "04401", name: "Traun", bezirk: "Linz-Land", bundesland: "Oberösterreich" },
  { kg: "04501", name: "Gmunden", bezirk: "Gmunden", bundesland: "Oberösterreich" },
  { kg: "04601", name: "Braunau am Inn", bezirk: "Braunau am Inn", bundesland: "Oberösterreich" },
  { kg: "04701", name: "Bad Ischl", bezirk: "Gmunden", bundesland: "Oberösterreich" },
  { kg: "04801", name: "Ried im Innkreis", bezirk: "Ried im Innkreis", bundesland: "Oberösterreich" },
  { kg: "04901", name: "Vöcklabruck", bezirk: "Vöcklabruck", bundesland: "Oberösterreich" },
  
  // Salzburg
  { kg: "05001", name: "Salzburg", bezirk: "Salzburg Stadt", bundesland: "Salzburg" },
  { kg: "05101", name: "Hallein", bezirk: "Hallein", bundesland: "Salzburg" },
  { kg: "05201", name: "Saalfelden", bezirk: "Zell am See", bundesland: "Salzburg" },
  { kg: "05301", name: "Zell am See", bezirk: "Zell am See", bundesland: "Salzburg" },
  { kg: "05401", name: "Bischofshofen", bezirk: "St. Johann im Pongau", bundesland: "Salzburg" },
  { kg: "05501", name: "St. Johann im Pongau", bezirk: "St. Johann im Pongau", bundesland: "Salzburg" },
  { kg: "05601", name: "Seekirchen am Wallersee", bezirk: "Salzburg-Umgebung", bundesland: "Salzburg" },
  
  // Tirol
  { kg: "06001", name: "Innsbruck", bezirk: "Innsbruck Stadt", bundesland: "Tirol" },
  { kg: "06101", name: "Kufstein", bezirk: "Kufstein", bundesland: "Tirol" },
  { kg: "06201", name: "Schwaz", bezirk: "Schwaz", bundesland: "Tirol" },
  { kg: "06301", name: "Hall in Tirol", bezirk: "Innsbruck-Land", bundesland: "Tirol" },
  { kg: "06401", name: "Wörgl", bezirk: "Kufstein", bundesland: "Tirol" },
  { kg: "06501", name: "Lienz", bezirk: "Lienz", bundesland: "Tirol" },
  { kg: "06601", name: "Telfs", bezirk: "Innsbruck-Land", bundesland: "Tirol" },
  { kg: "06701", name: "Imst", bezirk: "Imst", bundesland: "Tirol" },
  { kg: "06801", name: "Kitzbühel", bezirk: "Kitzbühel", bundesland: "Tirol" },
  { kg: "06901", name: "St. Johann in Tirol", bezirk: "Kitzbühel", bundesland: "Tirol" },
  
  // Vorarlberg
  { kg: "07001", name: "Bregenz", bezirk: "Bregenz", bundesland: "Vorarlberg" },
  { kg: "07101", name: "Dornbirn", bezirk: "Dornbirn", bundesland: "Vorarlberg" },
  { kg: "07201", name: "Feldkirch", bezirk: "Feldkirch", bundesland: "Vorarlberg" },
  { kg: "07301", name: "Bludenz", bezirk: "Bludenz", bundesland: "Vorarlberg" },
  { kg: "07401", name: "Hohenems", bezirk: "Dornbirn", bundesland: "Vorarlberg" },
  { kg: "07501", name: "Lustenau", bezirk: "Dornbirn", bundesland: "Vorarlberg" },
  { kg: "07601", name: "Hard", bezirk: "Bregenz", bundesland: "Vorarlberg" },
  { kg: "07701", name: "Rankweil", bezirk: "Feldkirch", bundesland: "Vorarlberg" },
  
  // Kärnten
  { kg: "08001", name: "Klagenfurt", bezirk: "Klagenfurt Stadt", bundesland: "Kärnten" },
  { kg: "08101", name: "Villach", bezirk: "Villach Stadt", bundesland: "Kärnten" },
  { kg: "08201", name: "Wolfsberg", bezirk: "Wolfsberg", bundesland: "Kärnten" },
  { kg: "08301", name: "Spittal an der Drau", bezirk: "Spittal an der Drau", bundesland: "Kärnten" },
  { kg: "08401", name: "Feldkirchen in Kärnten", bezirk: "Feldkirchen", bundesland: "Kärnten" },
  { kg: "08501", name: "St. Veit an der Glan", bezirk: "St. Veit an der Glan", bundesland: "Kärnten" },
  { kg: "08601", name: "Völkermarkt", bezirk: "Völkermarkt", bundesland: "Kärnten" },
  { kg: "08701", name: "Hermagor", bezirk: "Hermagor", bundesland: "Kärnten" },
  
  // Steiermark
  { kg: "09001", name: "Graz", bezirk: "Graz Stadt", bundesland: "Steiermark" },
  { kg: "09101", name: "Leoben", bezirk: "Leoben", bundesland: "Steiermark" },
  { kg: "09201", name: "Kapfenberg", bezirk: "Bruck-Mürzzuschlag", bundesland: "Steiermark" },
  { kg: "09301", name: "Bruck an der Mur", bezirk: "Bruck-Mürzzuschlag", bundesland: "Steiermark" },
  { kg: "09401", name: "Leibnitz", bezirk: "Leibnitz", bundesland: "Steiermark" },
  { kg: "09501", name: "Knittelfeld", bezirk: "Murtal", bundesland: "Steiermark" },
  { kg: "09601", name: "Köflach", bezirk: "Voitsberg", bundesland: "Steiermark" },
  { kg: "09701", name: "Deutschlandsberg", bezirk: "Deutschlandsberg", bundesland: "Steiermark" },
  { kg: "09801", name: "Weiz", bezirk: "Weiz", bundesland: "Steiermark" },
  { kg: "09901", name: "Hartberg", bezirk: "Hartberg-Fürstenfeld", bundesland: "Steiermark" },
  { kg: "10001", name: "Fürstenfeld", bezirk: "Hartberg-Fürstenfeld", bundesland: "Steiermark" },
  { kg: "10101", name: "Judenburg", bezirk: "Murtal", bundesland: "Steiermark" },
  { kg: "10201", name: "Murau", bezirk: "Murau", bundesland: "Steiermark" },
  { kg: "10301", name: "Liezen", bezirk: "Liezen", bundesland: "Steiermark" },
  { kg: "10401", name: "Bad Aussee", bezirk: "Liezen", bundesland: "Steiermark" },
  { kg: "10501", name: "Schladming", bezirk: "Liezen", bundesland: "Steiermark" },
  
  // Burgenland
  { kg: "11001", name: "Eisenstadt", bezirk: "Eisenstadt Stadt", bundesland: "Burgenland" },
  { kg: "11101", name: "Rust", bezirk: "Rust Stadt", bundesland: "Burgenland" },
  { kg: "11201", name: "Neusiedl am See", bezirk: "Neusiedl am See", bundesland: "Burgenland" },
  { kg: "11301", name: "Mattersburg", bezirk: "Mattersburg", bundesland: "Burgenland" },
  { kg: "11401", name: "Oberpullendorf", bezirk: "Oberpullendorf", bundesland: "Burgenland" },
  { kg: "11501", name: "Oberwart", bezirk: "Oberwart", bundesland: "Burgenland" },
  { kg: "11601", name: "Güssing", bezirk: "Güssing", bundesland: "Burgenland" },
  { kg: "11701", name: "Jennersdorf", bezirk: "Jennersdorf", bundesland: "Burgenland" },
];

// Funktion zum Suchen von Katastralgemeinden
export function searchKatastralgemeinden(
  query: string,
  bundesland?: string
): Katastralgemeinde[] {
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery && !bundesland) {
    return katastralgemeinden.slice(0, 20);
  }
  
  return katastralgemeinden.filter((kg) => {
    const matchesQuery = !normalizedQuery || 
      kg.name.toLowerCase().includes(normalizedQuery) ||
      kg.bezirk.toLowerCase().includes(normalizedQuery) ||
      kg.kg.includes(normalizedQuery);
    
    const matchesBundesland = !bundesland || kg.bundesland === bundesland;
    
    return matchesQuery && matchesBundesland;
  }).slice(0, 20);
}
