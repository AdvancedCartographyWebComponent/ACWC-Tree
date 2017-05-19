# ACWC-Tree
# Demo
Find the live demo [here](https://advancedcartographywebcomponent.github.io/ACWC-Tree/)
# specification
specification fonctionnelle
https://docs.google.com/document/d/1GspWIZkBGzxHU_LtTYtv4HsamsKYgjFfydVKdPU8GUU/edit?usp=sharing

# Instruction
To start, install npm and then run the following two commands:

npm install

npm start

# Build guide
npm run build

Find the index.html in the dossier build, change the href of the generated js and css in the html file:
delete the first "/" in the href.
# Get data from URL 
Use ?sko for tree data and ?geo for geolocation data, if you use both, add "&&"between two url

For example, 
```url
http://localhost:3000/?sko=https://api.myjson.com/bins/p9ytt&&?geo=https://api.myjson.com/bins/1fh1g1
```
or using sparql
```url
http://localhost:3000/?geo=https://semantic-forms.cc:8111/sparql?query=%0D%0APREFIX+rdfs%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23%3E%0D%0A%0D%0A%0D%0A%0D%0A%0D%0APrefix+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0D%0A%0D%0ACONSTRUCT+%7B%0D%0A++++%3Fsub+geo%3Along+%3FLON+.%0D%0A++++%3Fsub+geo%3Alat+%3FLAT+.%0D%0A%3Fsub+rdfs%3Alabel+%3FLAB.%0D%0A%0D%0A%7D%0D%0AWHERE+%7B%0D%0A++GRAPH+%3FGRAPH+%7B%0D%0A++++%3Fsub+geo%3Along+%3FLON+.%0D%0A++++%3Fsub+geo%3Alat+%3FLAT+.%0D%0A%3Fsub+rdfs%3Alabel+%3FLAB.%0D%0A++%7D%0D%0A%7D
```

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

The geolocation data should follow the structure like this:

```json
{
  "@graph" : [ {
    "@id" : "dbr:Alicudi",
    "@type" : "dbo:PopulatedPlace",
    "subject" : "dbc:Aeolian_Islands",
    "label" : {
      "@language" : "fr",
      "@value" : "Alicudi"
    },
    "lat" : "38.545833587646484375",
    "long" : "14.350000381469726562"
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
# TODO
Change markers style using following plugin:

https://github.com/lvoogdt/Leaflet.awesome-markers


