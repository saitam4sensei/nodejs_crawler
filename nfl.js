'use strict';

// const request = require('request');
const puppeteer = require('puppeteer');

// let proxyIP = "http://173.234.225.99:3128";


(async () => {
    var browserArguments = [];
   
    let browser = await puppeteer.launch({
        args: browserArguments,
        headless: false
    });

    let page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('Collecting . . .');

    let url = "https://www.nfl.com/players/kyler-murray/stats/"
    await page.goto(url, { waitUntil: 'load', timeout: 0 });
    
    const pl_element = await page.waitForSelector('#main-content  div.d3-l-section-row.nfl-c-player-header h1'); // select the element
    const player = await pl_element.evaluate(el => el.textContent); //
    const pos_num_element = await page.waitForSelector('#main-content div.nfl-c-player-header__player-data.nfl-u-hide-empty');
    const position_number = await pos_num_element.evaluate(el => el.textContent);
    const arr = position_number.trim().replace(/\r?\n|\r/g,"").split('•');
    const position = arr[0];
    const number = arr[1];

  

    const main_info = {
        player: player,
        position: position,
        number: number

    }

    
    const result = await page.$$eval('table[summary="Recent Games"] tr', rows => {
        return Array.from(rows, row => {
          const columns = row.querySelectorAll('td');
          return Array.from(columns, column => column.innerText);
        });
      });

    let tablerecent_length = result.length;
    console.log('length: ', tablerecent_length);
    
    console.log(main_info);
    console.log(result[tablerecent_length-1]);
   

})();