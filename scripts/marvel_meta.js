var K = require('krawler');
var k = new K;
var fs = require('fs');

var URLS = fs.readFileSync('./data/all_heroes_links.json', 'utf-8');
// var URLS = fs.readFileSync('./kk.json', 'utf-8');

try{
    URLS = JSON.parse(URLS);
}catch(e){
    console.log('ERROR PARSING JSON... sad face T_T');
    process.exit(0);
}


var visited = {};
var output = [];

crawlPage([URLS.shift().url]);

function crawlPage(urls){
    k.queue(urls)
    .on('data', function($, url, res){
        //Ensure we only visit each URL once.
        if(visited[url]) return
        visited[url] = true;

        console.log('url: ', url);

        var heroe = {};
        output.push(heroe);

        var props = $('#powerbox').find('p').slice(1, 7);

        props.each(function(i,item){
            /*
             * Example structure:
             * <p>
             *    <b>Real Name</b><br>Delroy Garrett, Jr.
             * </p>
            */
            var prop = $('b', item).html() || '';
            prop = prop.toLowerCase().replace(/\s/g,'_');

            //can't think of a way of doing this :/
            var value = $(item).html().split('<br>')[1];

            //real_name : Delroy Garrett, Jr.
            heroe[prop] = (value || '').trim();
        });

        var next = URLS.shift();
        if(next) crawlPage([next.url]);
        else done(output);
    })
    .on('error', function(err, url){
        console.log('ERR', err, url);
    });
}

function done(links){
    var out = JSON.stringify(links, null, 4);
    fs.writeFile('./data/meta_universe.json', out, function(err){
        console.log('File created: meta_universe.json');
    });
}
