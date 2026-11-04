// ===== Datos oficiales (Lista Maestra DOC-MCO-02 rev. 31 y "Caracterización de productos") =====
export const WA = '5214772312260';
export const WA_TEXTO = 'Hola, quiero más información de Quesos Sn Roque';
export const REDES = [
  ['Instagram','https://www.instagram.com/quesosnroque/','@quesosnroque'],
  ['TikTok','https://www.tiktok.com/@quesos.snroque','@quesos.snroque'],
  ['Facebook','https://www.facebook.com/profile.php?id=61567377028323','Quesos Sn Roque'],
  ['Sitio','https://www.quesossnroque.com/','quesossnroque.com']
];

// clave, familia, nombre, presentación, contenido
export const P = [
 ['001','asadero','Asadero Bola 200 g','Vitafilm','200 g'],
 ['002','asadero','Asadero Bola 400 g','Vitafilm','400 g'],
 ['003','asadero','Asadero Bola 1 kg','Vitafilm','1 kg'],
 ['004','asadero','Asadero Bola 3 kg','Vitafilm','3 kg'],
 ['019','asadero','Asadero Bola 400 g','Termoformado','400 g'],
 ['020','asadero','Asadero Espiral 200 g','Termoformado','200 g'],
 ['018','asadero','Asadero Chipotle Redondo 200 g','Termoformado','200 g'],
 ['007','asadero','Asadero Barra 500 g','Termoformado','500 g'],
 ['006','asadero','Asadero Barra 1 kg','Al vacío','1 kg'],
 ['016','asadero','Asadero Barra 1 kg','Vitafilm','1 kg'],
 ['008','asadero','Asadero Tiras 1 kg','Bolsa','1 kg'],
 ['011','asadero','Asadero Tiras 3 kg','Bolsa','3 kg'],
 ['029','asadero','Asadero Rallado 200 g','Bolsa','200 g'],
 ['010','asadero','Asadero Rallado 1 kg','Bolsa','1 kg'],
 ['012','asadero','Asadero Rallado 3 kg','Bolsa','3 kg'],
 ['027','oaxaca','Oaxaca Bola 200 g','Termoformado','200 g'],
 ['028','oaxaca','Oaxaca Bola 400 g','Termoformado','400 g'],
 ['000','manchego','Manchego Redondo 200 g','Termoformado','200 g'],
 ['013','mozzarella','Mozzarella Rallado 1 kg','Bolsa','1 kg'],
 ['101','ranchero','Ranchero Redondo 150 g','Termoformado','150 g'],
 ['102','ranchero','Ranchero Redondo 300 g','Termoformado','300 g'],
 ['106','ranchero','Ranchero Redondo 150 g','Laminado','150 g'],
 ['107','ranchero','Ranchero Redondo 300 g','Laminado','300 g'],
 ['103','ranchero','Ranchero Barra 500 g','Vitafilm','500 g'],
 ['051','adobera','Adobera Redondo 150 g','Termoformado','150 g'],
 ['053','adobera','Adobera Barra 250 g','Vitafilm','250 g'],
 ['054','adobera','Adobera Barra 500 g','Vitafilm','500 g'],
 ['157','panela','Panela Redondo 200 g','Termoformado','200 g'],
 ['156','panela','Panela Redondo 400 g','Termoformado','400 g'],
 ['153','panela','Panela Redondo 1 kg','Al vacío','1 kg'],
 ['201','crema','Crema Natural 220 ml','Vaso · 215 g','220 ml'],
 ['202','crema','Crema Natural 430 ml','Vaso · 430 g','430 ml'],
 ['208','crema','Crema Natural 224.5 ml','Bolsa · 220 g','224.5 ml'],
 ['203','crema','Crema Natural 1 L','Bolsa · 980 g','1 L'],
 ['213','crema','Crema Acidificada 200 ml','Vaso · 196 g','200 ml'],
 ['214','crema','Crema Acidificada 426 ml','Vaso · 417.5 g','426 ml'],
 ['301','jocoque','Jocoque 1 L','Vaso','1 L'],
 ['250','cajeta','Cajeta 250 g','Vaso','250 g'],
 ['251','cajeta','Cajeta 500 g','Vaso','500 g'],
 ['252','cajeta','Cajeta 1 kg','Vaso','1 kg'],
 ['253','cajeta','Cajeta 5 kg','Cubeta','5 kg'],
 ['254','cajeta','Cajeta 24 kg','Cubeta','24 kg']
];

// Familias: nombre, color de los cuadros del empaque, foto principal, frase corta
export const FAM = {
  asadero:   {n:'Asadero',    c:'#B8352B', hero:'020', frase:'El de fundir: quesadillas, enchiladas, chilaquiles.'},
  oaxaca:    {n:'Oaxaca',     c:'#2F7CC9', hero:'027', frase:'Fresco y de hebra, para deshebrar y fundir.'},
  manchego:  {n:'Manchego',   c:'#8E2B22', hero:'000', frase:'Madurado, de pasta firme, para rebanar.'},
  adobera:   {n:'Adobera',    c:'#D29A1C', hero:'051', frase:'Pasta blanda, suave, se funde parejito.'},
  ranchero:  {n:'Ranchero',   c:'#4C9E3A', hero:'102', frase:'Fresco y desmoronable, para sopes y frijoles.'},
  panela:    {n:'Panela',     c:'#2E6DB4', hero:'157', frase:'Blando y suave; se asa sin perder la forma.'},
  mozzarella:{n:'Mozzarella pizzero', c:'#0F7F3D', hero:'013', frase:'Rallado, ligeramente madurado, para pizza y pastas.'},
  crema:     {n:'Cremas',     c:'#5BAF3F', hero:'202', frase:'Natural y acidificada, espesas y suaves.'},
  jocoque:   {n:'Jocoque',    c:'#86B83E', hero:'301', frase:'Ácido y cremoso, para untar y comer solo.'},
  cajeta:    {n:'Cajeta',     c:'#4E9BD1', hero:'251', frase:'Dulce de leche brillante para postres y pan.'}
};
export const FAM_ORDER = ['asadero','oaxaca','manchego','adobera','ranchero','panela','mozzarella','crema','jocoque','cajeta'];

// Características y usos por clave (archivo "Caracterización de productos", hoja Lista maestra)
export const CARACT = {
  asadero:   {car:['Pasta semiblanda','Fundible','Hilada'], uso:['Quesadillas','Enchiladas','Chilaquiles','Gratinados ligeros']},
  chipotle:  {car:['Pasta semiblanda','Fundible','Hilada','Con chile chipotle'], uso:['Quesadillas','Chilaquiles','Carne asada','Botanas']},
  manchego:  {car:['Madurado','Pasta firme','Baja elasticidad','Textura cremosa'], uso:['Quesadillas','Sándwiches','Hamburguesas','Pastas gratinadas','Pizzas','Tabla de quesos']},
  oaxaca:    {car:['Fresco','Pasta hilada','Fundible','Forma hebra'], uso:['Quesadillas','Enchiladas','Carne asada']},
  adobera:   {car:['Fresco','Pasta blanda','Acidificado','Fundible'], uso:['Quesadillas','Enchiladas','Chilaquiles','Gratinados ligeros']},
  ranchero:  {car:['Fresco','Desmoronable'], uso:['Tacos','Enchiladas','Sopes','Frijoles']},
  panela:    {car:['Fresco','Blando','Suave','Olor agridulce','Mantiene su forma al asarse'], uso:['Asar','Ensaladas','Platillos frescos']},
  crema:     {car:['Espesa','Suave','Textura cremosa'], uso:['Sopas','Salsas cremosas','Tacos','Enchiladas','Pastas','Postres']},
  cremaAcida:{car:['Espesa','Suave','Textura cremosa'], uso:['Sopas','Salsas cremosas','Tacos','Enchiladas','Pastas']},
  cajeta:    {car:['Semilíquida','Dulce','Láctea','Viscosa','Brillante'], uso:['Repostería','Panificación','Dulcería','Postres','Bebidas']},
  jocoque:   {car:['Ácido','Textura cremosa'], uso:['Comer solo','Galletas','Pan','Salsas','Mermeladas','Aderezos']},
  mozzSrq:   {car:['Ligeramente madurado','Ácido','Fundible'], uso:['Pizzas','Pastas','Enchiladas','Quesadillas']}
};
export const CARACT_CODE = {
  '000':'manchego','018':'chipotle','027':'oaxaca','028':'oaxaca','051':'adobera','053':'adobera','054':'adobera',
  '101':'ranchero','102':'ranchero','103':'ranchero','106':'ranchero','107':'ranchero',
  '153':'panela','156':'panela','157':'panela',
  '201':'crema','202':'crema','203':'crema','208':'crema','213':'cremaAcida','214':'cremaAcida',
  '250':'cajeta','251':'cajeta','252':'cajeta','253':'cajeta','254':'cajeta','301':'jocoque',
  '013':'mozzSrq'
};
export function caract(p){ return CARACT[CARACT_CODE[p[0]] || 'asadero'] || {car:[],uso:[]}; }

// Platillos del selector "¿Qué vas a preparar?" → se cruzan con los usos oficiales
export const PLATILLOS = [
  ['Quesadillas','Quesadillas'],
  ['Tacos','Tacos'],
  ['Enchiladas','Enchiladas'],
  ['Chilaquiles','Chilaquiles'],
  ['Pizzas','Pizzas'],
  ['Hamburguesas','Hamburguesas'],
  ['Sopes y frijoles','Sopes'],
  ['Ensaladas','Ensaladas'],
  ['Sopas y salsas','Sopas'],
  ['Postres','Postres']
];

// Fotos reales del queso fuera del empaque (reels de la agencia y video de Famo)
export const FOTO_FAM={panela:'assets/fam/panela.webp',asadero:'assets/fam/asadero.webp',oaxaca:'assets/fam/oaxaca.webp',ranchero:'assets/fam/ranchero.webp',mozzarella:'assets/fam/mozzarella.webp',crema:'assets/fam/cremas.webp',cajeta:'assets/fam/cajeta.webp'};
