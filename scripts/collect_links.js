var K = require('krawler');
var k = new K;
var fs = require('fs');


/*
 * Table ID, estructure:
 * table > tr > td > ul > li > a
 */
var ID = '#mw-pages';

/*
 * The URLs returned by links are all relative,
 * we prepend the BASE to make them absolute.
 */
var BASE = 'http://marvel.com';

/*
 * Initial URL, we start here!
 */
var entryPoint = ['http://marvel.com/universe/Category:Heroes'];


var visited = {};
var output = [];

crawlPage(entryPoint);

function crawlPage(urls){
    k.queue(urls)
    .on('data', function($, url, res){
        //Ensure we only visit each URL once.
        if(visited[url]) return
        visited[url] = true;

        //table > tr > td > ul > li > a
        var $links = $('li', ID).find('a');

        //We store title and link
        $links.each(function(i, item){
            output.push({
                title: $(item).html(),
                url: BASE + $(item).attr('href')
            });
        });

        console.log('- Scraping Hero links from', url);

        /*
         * The site has two of this paginate items,
         * one above the table and one below, we pick
         * one.
         */
        var paginate = $('.paginate a:last-child[href]')[1];

        if(paginate && $(paginate).html().indexOf('next') !== -1){
            //we follow the "next 200" pagination link.
            crawlPage([ BASE + $(paginate).attr('href')]);
        } else {
            //No more pagination, done ::)
            done(output);
        }
    })
    .on('error', function(err, url){
        console.log('ERR', err, url);
    });
}



function done(links, label){
    var out = JSON.stringify(links, null, 4);
    fs.writeFile('./data/all_heroes_links.json', out, function(err){
        console.log('File created: all_heroes_links.json');
    });
}





