# ACWC-Tree
# Demo
Find the live demo [here](https://advancedcartographywebcomponent.github.io/ACWC-Tree/)
# specification
specification fonctionnelle
https://docs.google.com/document/d/1GspWIZkBGzxHU_LtTYtv4HsamsKYgjFfydVKdPU8GUU/edit?usp=sharing

# Instruction
To start, install npm and then run the following two commands:
```
npm install

npm start
```
# Build guide
Assuming that you have already install the dependencies by **npm install**, or you should run it before build.
```
npm run build
```
Then:
  1. Find the index.html in the folder **build**, 
  2. Find the href of the generated js and css in the html file,
  3. Delete the first "/" in the href.

# Get data from URL (2 Ways)
## Way 1
Use ?sko for tree-menu data and ?geo for geolocation data, if you use both, add "&&" between two url

For example, when you want to set tree-menu data, add ?sko=(your url)
```url
http://localhost:3000/?sko=https://api.myjson.com/bins/p9ytt
```
when you want to set geo-location data, add ?geo=(your url)
for example:
```url
http://localhost:3000/?geo=https://semantic-forms.cc:8111/sparql?query=%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0A%0D%0A%0D%0A%0D%0A%0D%0APrefix+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0A%0D%0ACONSTRUCT+%7B%0D%0A++++%3Fsub+geo%3Along+%3FLON+.%0D%0A++++%3Fsub+geo%3Alat+%3FLAT+.%0D%0A%3Fsub+rdfs%3Alabel+%3FLAB.%0D%0A%0D%0A%7D%0D%0AWHERE+%7B%0D%0A++GRAPH+%3FGRAPH+%7B%0D%0A++++%3Fsub+geo%3Along+%3FLON+.%0D%0A++++%3Fsub+geo%3Alat+%3FLAT+.%0D%0A%3Fsub+rdfs%3Alabel+%3FLAB.%0D%0A++%7D%0D%0A%7D
```
Or you can use both url:
```
http://localhost:3000/?sko=https://api.myjson.com/bins/p9ytt&&?geo=https://semantic-forms.cc:8111/sparql?query=%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0A%0D%0A%0D%0A%0D%0A%0D%0APrefix+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0A%0D%0ACONSTRUCT+%7B%0D%0A++++%3Fsub+geo%3Along+%3FLON+.%0D%0A++++%3Fsub+geo%3Alat+%3FLAT+.%0D%0A%3Fsub+rdfs%3Alabel+%3FLAB.%0D%0A%0D%0A%7D%0D%0AWHERE+%7B%0D%0A++GRAPH+%3FGRAPH+%7B%0D%0A++++%3Fsub+geo%3Along+%3FLON+.%0D%0A++++%3Fsub+geo%3Alat+%3FLAT+.%0D%0A%3Fsub+rdfs%3Alabel+%3FLAB.%0D%0A++%7D%0D%0A%7D
```
## Way 2 
**Import**: All the request should be loaded over https.

There are two global variables for configure the data.
You can reset the value of **window.treeUrl** to be the url for tree-menu with the prefix **?sko=**, for example:
```javascript
window.treeUrl = "?sko=https://api.myjson.com/bins/p9ytt"
```
And you can do the same thing with **window.mapDataUrl** to set the map data with the prefix **?geo=**.

Also, you can do the same thing with **window.geojsonUrl** to set the map data with the prefix **?geo=**. **Important**:It can not work with the tree-menu and the url should contain the [geojson](http://geojson.org/) data.

```javascript
window.treeUrl = "?geo=https://sementicbus-simonzen.rhcloud.com/data/api/AlternatibaMartigue"
```


In this case, we use semantic form to query and structure geo-location data.
See more info of semantic forms [**here**](semantic-forms.cc:9111/tools)

The tree data should follow the structure like this:
```json
{
  "@graph" : [ {
    "@id" : "dbc:Abbey_of_Saint_Gall",
    "broader" : "dbc:World_Heritage_Sites_in_Switzerland"
  }, {...}],
  "@context" : {
    "broader" : {
      "@id" : "http://www.w3.org/2004/02/skos/core#broader",
      "@type" : "@id"
    },
    "dbc" : "http://dbpedia.org/resource/Category:",
    "skos" : "http://www.w3.org/2004/02/skos/core#"
  }
}

```
**"broader"** is the parent of **"@id"**  
So the structure will be like the following graph if you have plusieur records.<br />
**"broader"**<br />
 -**"@id"**<br />
 -**"@id"**<br />
 -**"@id"**<br />


The geolocation data should follow the structure like this:

```json
{
  "@graph" : [ {
    "@id" : "dbr:Alicudi",
    "@type" : "dbo:PopulatedPlace",
    "subject" : "dbc:Aeolian_Islands",
    "markerAndIcons":[
	{icon:"motorcycle",color:"CADETBLUE",number:null},
	{icon:"some icon",color:"some color",number:null}],
    "label" : {
      "@language" : "fr",
      "@value" : "Alicudi"
    },
    "lat" : "38.545833587646484375",
    "long" : "14.350000381469726562",
    "any data you want";"data"
  }, {...}],
  "@context" : {
    "subject" : {
      "@id" : "http://purl.org/dc/terms/subject",
      "@type" : "@id"
    },
    "long" : {
      "@id" : "http://www.w3.org/2003/01/geo/wgs84_pos#long",
      "@type" : "http://www.w3.org/2001/XMLSchema#float"
    },
    "lat" : {
      "@id" : "http://www.w3.org/2003/01/geo/wgs84_pos#lat",
      "@type" : "http://www.w3.org/2001/XMLSchema#float"
    },
    "label" : {
      "@id" : "http://www.w3.org/2000/01/rdf-schema#label"
    },
    "geo" : "http://www.w3.org/2003/01/geo/wgs84_pos#",
    "dbo" : "http://dbpedia.org/ontology/",
    "dct" : "http://purl.org/dc/terms/",
    "dbc" : "http://dbpedia.org/resource/Category:",
    "rdf" : "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "dbr" : "http://dbpedia.org/resource/",
    "xsd" : "http://www.w3.org/2001/XMLSchema#",
    "rdfs" : "http://www.w3.org/2000/01/rdf-schema#"
  }
}
```  
**"@id"** is the id of the poi  
**"@type"** is the type of the poi  
**"subject"** is the parent of the poi, it works like the external key, linking to the **"@id"** in tree-menu  
**"markerAndIcons"** is the icons' configuration for markers, you can set the icons inside the markers, maximum 1 anchor marker and 6 surrounding markers.   
	**icon** is the icon style, you can use fontawesome's icon. If you want to add number, you should set it as   
	```	
	icon:"number"   
	```
	and then add number in **number**  
	```
	number:6  
	```
	**color** is the color setting.  
**"label"** is the name of poi  
**"lat"**,**"long"** is latitude and longitude of the poi      

# Set Map Context and information displayed on the panel and table
```javascript
  var mapContext = {
        "center":[48.836703,2.334345],
        "zoom": 6
      };
```
**center** is the default center of map  
**zoom** is the default zoom of map  
```javascript
var infoKeyForTable=[
    {key:'Subject',displayValue:'Subject'},
    {key:'Name',displayValue:'Name'}
    ];
```
**key** is the data field(column) of the database  
**displayValue** is the value you want to display in the table or panel.  

```javascript
  var infoKeyForPanel=[
    {key:'Subject',displayValue:'Subject'},
    {key:'Name',displayValue:'Name'},
    {key:'Abstract',displayValue:'Abstract'}
    ];
```
**key** is the data field(column) of the database  
**displayValue** is the value you want to display in the table or panel.  

# TODO
Change markers style using following plugin:

https://github.com/lvoogdt/Leaflet.awesome-markers


