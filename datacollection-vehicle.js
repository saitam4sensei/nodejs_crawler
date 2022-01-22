
const puppeteer = require('puppeteer');
const request = require('request');
const fs = require('fs');
//const translate = require('translate');

const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));
let proxyIP = "http://50.22.25.251:3128";


//FUNCTIONS
const getIDLog = () => new Promise(resolve => {
    console.log('starting');
    request.get({
        uri: '',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': ''
        },

    }, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(`statusCode: ${res.statusCode}`)
        //console.log(JSON.parse(body)) 
        let IDLog = JSON.parse(body)[0].ID //added
        //console.log(IDLog);
        resolve(IDLog);
    })
});




const SaveData = (json) => new Promise(resolve => {
    let options = {
        'url': '',
        'method': 'POST',
        'headers': {
            'Authorization': 'Basic aWRpcmVjdGRldjpMUjZZYk81ZnhEZnQxM',
            'Content-Type': 'application/json'
        },
        'body': JSON.stringify(json)
    };

    request(options, function callback(error, body) {
        let uploadedVehicleInfo = [];

        try {
            if (error) {
                console.log("uploadedVehicleInfo unsuccessful");
            }
            else {
                console.log('-----inserted-----');
            }
           
        } catch (requestError) {
            console.log('SaveData requestError Exception: ' + requestError.message);
        }

        resolve(uploadedVehicleInfo);
    });
});




const SaveLogData = (Msg, IDLog) => new Promise(resolve => {

    var postdata = {
        id: IDLog,
        Message: Msg
    };
    request.post({
        uri: '',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic aWRpcmVjdGRldjpMUjZZYk81ZnhEZnQxMGx'
        },
        body: JSON.stringify(postdata)

    }, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(body.body);
    })
});




const StringCombine = (main, sub) => new Promise(resolve => {
    var link = '';
    if (sub) {
        var res = main.replace(main.substring(0, main.indexOf('_') + 1), '-');
        res = res.substring(0, res.indexOf('_')).replace('-', 'https://www.website');

        var cut = sub.substring(0, sub.indexOf("key=") + 5);

        var img = cut.substring(
            cut.lastIndexOf("_") + 1,
            cut.lastIndexOf(".jpg")
        )
        link = res + '_' + img + '.JPG?key=1';

    }

   resolve(link);
   
});



(async () => {
  
    var browserArguments =  ['--no-sandbox', '--disable-setuid-sandbox', '-disable-gpu', '--no-first-run', '--disable-notifications', '--disable-extensions'];
    if (proxyIP) browserArguments.push('--proxy-server=' + proxyIP);
     
    const browser = await puppeteer.launch({
      //ignoreDefaultArgs: [
      //  '--no-sandbox',
      //  '--disable-setuid-sandbox',
      //  '--disable-dev-shm-usage',
      //  '--disable-accelerated-2d-canvas',
      //  '--no-first-run',
      //  '--no-zygote',
      //  '--single-process',
      //  '--disable-gpu'
      //],
      headless: false,
      args: browserArguments
  });

    const page2 = await browser.newPage(); //for translation
    const page = await browser.newPage();
    let pageUrl;
    let hasError = 0;

    let translation = "https://translate.google.com/#view=home&op=translate&sl=ja&tl=en&text="
    await page2.goto(translation, { waitUntil: 'load', timeout: 0 });

    let IDLog = await getIDLog();  

    try {


    let xx = 0;
    page.setUserAgent("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/45.0.2454.101 Safari/537.36");
    
    await page.setViewport({
      width: 1920,
      height: 1080,
    });
   
    //BROWSING THE SITE
    await page.goto("https://website.com", { waitUntil: 'load', timeout: 0 });
  
    
    await page.waitForSelector("a.login-btn.btn.btn-info");
    await page.click('a.login-btn.btn.btn-info');
    //LOGGING IN
    await page.waitForSelector("input.form-control.login_id");
    await page.waitForSelector("input.form-control.login_password");
    await page.waitFor(2000);    
    await page.type('input.form-control.login_id', "username", { delay: 100 });
    await page.type('input.form-control.login_password', "password", { delay: 100 });

    await page.waitFor(3000);
    await page.waitForSelector('#login_button', {
        timeout: 10000
    });
    
    await page.evaluate(() => document.querySelector('#login_button').click());
  
    //TRANSLATE BUTTON---> TO ENGLISH
    try {
        await page.waitForSelector("a#toggle_lang.jp");
        await page.click('a#toggle_lang.jp');
    } catch {
        
     try {
      
      await page.waitForSelector("button.button-yes");
      await page.click('button.button-yes');
      await page.waitForSelector("a#toggle_lang.jp");
      await page.click('a#toggle_lang.jp');
     }
     catch {
     }
    }

    await page.waitForSelector("a#btn_vehicle_everyday_clear");
    await page.click('a#btn_vehicle_everyday_clear');
    await page.click('a#btn_vehicle_day_clear');
    
    await sleep(2000)

        
    await page.evaluate(() => document.querySelector("#vehicle_everyday_991").click());
    await page.evaluate(() => document.querySelector("#vehicle_everyday_958").click());

    await page.click('button.page-next-button.col-md-2.col-xs-4');

    
    await page.waitForSelector("#maker-domestic-all");
    await page.click('#maker-domestic-all');
    await page.click('#maker-foreign-all');
   
    const getModelData = await page.$$eval('div#box-type.search-scroll-box-body ul li div span:nth-child(1)', el => el.map((span) => {
      return span.textContent;
    }));

    
    const model_filter = 'CX-5, AQUA, Forester, Axela, Corolla Axio, Demio, Fit, Land Cruiser Prado, Note, Outlander, Vitz, Voxy, Wish, X-Trail';

      if (getModelData.length > 0)
      {
        for(let i=0;i<getModelData.length;i++)
        {
            
            
            if (getModelData[i] == 'That\'s')
            {
                
            }
            else if (model_filter.indexOf(getModelData[i]) >= 0) {
                //console.log(getModelData[i]);
                const data_name = "input[data-name='" + getModelData[i] + "']";
                await page.$eval(data_name, el => el.click());
                
            }
            
              
        }
          
      }
    
        try {
            await page.waitForSelector('#box-type li:nth-child(1) input[type=checkbox]');
            await page.evaluate(() =>
                document.querySelector("#box-type li:nth-child(1) input[type=checkbox]").click());
            await page.waitFor(1000);
            await page.evaluate(() =>
                document.querySelector("#box-type li:nth-child(1) input[type=checkbox]").click());
        }
        catch{ }
        

    let Dataresult = [];
    let count = 0
    //inserted
    let idv_all = [];

    
        await page.$eval('#next-bottom', el => el.disabled = false);

        await sleep(5000)

        await page.click('#next-bottom');
        console.log('1');
        await page.waitForSelector('table#carlist');
        console.log('2');
        
        await sleep(2000)

        await page.setRequestInterception(true);


        page.on('request', (req) => {
            if (req.resourceType() == 'image')
                req.abort();
            else
                req.continue();
        });

    
        const total_page = await page.$$eval('#select_pager', el => el.map((option) => {
            return option[0].innerText;
        }));

        //let total = 0;

        total = total_page.toString().split('/')[1];
        //total = 2;

        console.log('Pages: ' + total);
        console.log('Scraping IDVehicles ... ');
        for (let o = 0; o < total; o++) {
            const idvehicles = await page.$$eval('table#carlist tbody tr[id*="row"].line-strike', el => el.map(x => x.getAttribute("data-vid")));

            for (var idvehicle of idvehicles) {
                if (o == 0) {
                    idv_all.push(idvehicle);
                }
                else {
                    if (!(idv_all.indexOf(idvehicle) >= 0))
                        idv_all.push(idvehicle);
                }

            }

            await page.waitFor(3000);
            await page.waitForSelector('#row1');
            try {
                await page.$eval('#pager-link-next', el => el.click());
            }
            catch{

            }

        }
    
        console.log(idv_all);


        //////////////////////////

        await sleep(2000);
        
          
        console.log(idv_all.length)

        if (idv_all.length > 0)
        {
          for (let i = 0; i < idv_all.length ; i++) //(vehicleCount + 500)
                {
                  await page.waitFor(1000);
                  let uri = 'https://www.website.com' + idv_all[i] + '&owner_id=&from=vehicle';  
                  await page.goto(uri, { waitUntil: 'load', timeout: 0 });

                  delete idv_all[i];
                
                  try {
                      await page.waitForSelector('#detail', { timeout: 2000 })
                      await page.waitForSelector('#detail-pager', { timeout: 2000 })
                  }
                  catch {
                    try {
                        await page.waitForSelector('#iauc-error')
                        const error_txt = await page.$$eval('#error-title', el => el.map((div) => {
                            return div.innerHTML;
                        }));
                        console.log(error_txt);
                        if (error_txt !== 'Not Found') {
                            error_txt = '';
                            await page.goto("https://www.website.com/", { waitUntil: 'load', timeout: 0 });

                            await page.waitForSelector("a.login-btn.btn.btn-info");
                            await page.click('a.login-btn.btn.btn-info');

                            await page.waitForSelector("input.form-control.login_id");
                            await page.waitForSelector("input.form-control.login_password");

                            await page.type('input.form-control.login_id', "userid"); //A141215
                            await page.type('input.form-control.login_password', "password");

                            await page.click('#login_button');
                            try {
                                await page.waitForSelector("a#toggle_lang.jp");
                                await page.click('a#toggle_lang.jp');
                            } catch {

                                try {

                                    await page.waitForSelector("button.button-yes", {
                                        timeout: 5000
                                    });
                                    await page.click('button.button-yes');
                                    await page.waitForSelector("a#toggle_lang.jp");
                                    await page.click('a#toggle_lang.jp');
                                }
                                catch {
                                }
                            }
                            await sleep(2000);
                            await page.goto(uri, { waitUntil: 'load', timeout: 0 });
                        }
                        
                    }
                    catch (e) {
                        console.log('Opening vehicle ERROR: ' + e);
                      
                    }
                    
              }
             
            
              await page.waitFor(1000);
              console.log('getting details...');
               
              var DataGwapo = {};
             

              

                  const headers = await page.$$eval('#detail-attr h4', el => el.map((h4) => {
                      return h4.firstChild.textContent;
                  }));

                  const rows = await page.$$eval('#detail-attr p', el => el.map((p) => {
                      return p.textContent.trim();
                  }));

                  const headers_detailvenue = await page.$$eval('#detail-venue h4', el => el.map((h4) => {
                      return h4.firstChild.textContent;
                  }));

                  const rows_detailvenue = await page.$$eval('#detail-venue p', el => el.map((p) => {
                      return p.firstChild.textContent;
                  }));
                  const detailname = await page.$$eval('#detail-name p', el => el.map((p) => {
                      return p.firstChild.textContent;
                  }));



              try {
                  for (var x = 0; x < headers.length; x++) {

                      DataGwapo[headers[x].replace(/\s/g, '').replace('.', '').replace('/', '').replace('-', '')] = rows[x]

                      if (headers_detailvenue) {
                          for (var y = 0; y < headers_detailvenue.length; y++) {

                              DataGwapo[headers_detailvenue[y].replace(/\s/g, '').replace('.', '').replace('/', '').replace('-', '')] = rows_detailvenue[y]
                          }
                      }
                  }
              
              ///TRANSLATION
              xx = xx + 1
              console.log(xx);
                  var noswiper = 0;
                  
                  console.log('opening modal...');
                  try {

                      await page.$eval('#other-img div div.swiper-wrapper div:nth-child(1) img', clickmodal => clickmodal.click());
                     
                      await page.waitFor(500);
                      await page.waitForSelector('#swiper-imgview', { timeout: 3000 });
                  }
                  catch {
                      noswiper = 1;
                  }

                  let hasSheet = 1;
                  const main_imgs = await page.$$eval('div#detail-imgs.row .row #btn-iv img[src]', imgs => imgs.map(img => img.getAttribute('src')));
            
                  try {
                      await page.waitForSelector('div#detail-imgs.row .row #btn-iv .layout-img img', { timeout: 1000 })
                      hasSheet = 0;
                  } catch (error) {
                      try {
                          await page.waitForSelector('div#detail-imgs.row div.col-md-8.attr-tbl.noflex', { timeout: 1000 })
                          hasSheet = 0;
                      } catch (error) {

                      }       
                  }
                
              let translation_result = '';
              try {
                  //delete DataGwapo.Inspection;
                  //console.log(DataGwapo);
                  console.log('translating...');
                  let dataCHange = JSON.stringify(JSON.stringify(DataGwapo)); //.replace(/"/g, '@');
                  
                  await page2.goto(translation, { waitUntil: 'load', timeout: 0 });
                  
                  let sel = 'div textarea';
                  let translatedResult;
                  let data = [];

                  //await page2.evaluate((data) => { return document.querySelector(data.sel).value = data.datatrans }, { sel, datatrans })
                  await page2.goto(translation + dataCHange, { waitUntil: 'load', timeout: 0 });
                 
                  try {
                      await page2.waitForSelector('span [data-language-for-alternatives="en"]');
                      translatedResult = await page2.$$eval('span [data-language-for-alternatives="en"]', el => el.map((span) => {
                          return span.innerText.trim();
                      }))
                  } catch{
                      await page2.waitForSelector('span.tlid-translation.translation');
                      translatedResult = await page2.$$eval('span.tlid-translation.translation', el => el.map((span) => {
                          return span.textContent.trim();
                      }))
                  }
                 
                  console.log(translatedResult);

                  translation_result = translatedResult.toString().replace(/'/g, '')
                      .replace(/\\/g, '')
                      .replace(/""/g, '"')
                      .replace('"{', '{')
                      .slice(0, -1)
                      .replace(/\\n/g, "\\n").replace(/:","/g, ':"","').replace(':"}', ':""}').replace(/:", "/g, ':"","').replace(/":" "/g,'": "')
                      .replace(/: ","/g,':"","')
                      .replace(/\\'/g, "\\'")
                      .replace(/\\"/g, '\\"')
                      .replace(/\\&/g, "\\&")
                      .replace(/\\r/g, "\\r")
                      .replace(/\\t/g, "\\t")
                      .replace(/\\b/g, "\\b")
                      .replace(/\\f/g, "\\f");
                  // remove non-printable and other non-valid JSON chars
                  translation_result = translation_result.replace(/[\u0000-\u0019]+/g, "");
                  
                  Dataresult.push(JSON.parse(translation_result));

                  
              } catch (e) {
                  
                  console.log(e);

                  let filename = new Date().toLocaleDateString().replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString().replace(/:/g, '-');
                  fs.writeFileSync('dealer-log-translation/' + filename + '.txt', translation_result+'\n'+e);

                  Dataresult.push(DataGwapo);
                  //break;
              }


              //console.log(Dataresult);
            var ChassisNo = detailname.filter((v, i, a) => a.indexOf(v) === i); 
            var arr = ChassisNo[ChassisNo.length - 1].split(' '); 

            Dataresult[count].Make = ChassisNo[0];

                  try {
                      await page.waitForSelector('body.modal-open', { timeout: 3000 });
                      await page.waitFor(1000);

                      
                  }
                  catch{

                  }
                  const other_imgs = await page.$$eval('#swiper-imgview div div img[src]', imgs => imgs.map(img => img.getAttribute('src')));
                 
              //other_imgs.filter((item, index) => other_imgs.indexOf(item) === index);
                  try {
                      Dataresult[count].imgSheet = main_imgs[0];
                      //console.log(StringCombine(main_imgs[0], other_imgs[9]));
                      console.log('HASSHEET :' + hasSheet);
                      if (hasSheet) {
                          Dataresult[count].Image1 = main_imgs[0]
                      }
                      else {
                          Dataresult[count].Image1 = main_imgs[1]
                      }

                    
                      if (noswiper) {
                          Dataresult[count].Image2 = main_imgs[2] ? main_imgs[2] : '';
                          Dataresult[count].Image3 = main_imgs[3] ? main_imgs[1] : '';
                          //Dataresult[count].Image4 = '';
                          //Dataresult[count].Image5 = '';
                          //Dataresult[count].Image6 = '';
                          Dataresult[count].Image4 = (other_imgs[12] ? other_imgs[12].substring(0, other_imgs[12].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[13].substring(0, other_imgs[13].indexOf('key=') + 5) : '');
                          Dataresult[count].Image5 = (other_imgs[14] ? other_imgs[14].substring(0, other_imgs[14].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[15].substring(0, other_imgs[15].indexOf('key=') + 5) : '');
                          Dataresult[count].Image6 = (other_imgs[16] ? other_imgs[16].substring(0, other_imgs[16].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[17].substring(0, other_imgs[17].indexOf('key=') + 5) : '');

                      }
                      else {
                          Dataresult[count].Image2 = main_imgs[2] ? main_imgs[2] : other_imgs[9];
                          Dataresult[count].Image3 = (other_imgs[10] ? other_imgs[10].substring(0, other_imgs[10].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[11].substring(0, other_imgs[11].indexOf('key=') + 5) : '');
                          Dataresult[count].Image4 = (other_imgs[12] ? other_imgs[12].substring(0, other_imgs[12].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[13].substring(0, other_imgs[13].indexOf('key=') + 5) : '');
                          Dataresult[count].Image5 = (other_imgs[14] ? other_imgs[14].substring(0, other_imgs[14].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[15].substring(0, other_imgs[15].indexOf('key=') + 5) : '');
                          Dataresult[count].Image6 = (other_imgs[16] ? other_imgs[16].substring(0, other_imgs[16].indexOf('key=') + 5) : '') + ';' + (other_imgs[11] ? other_imgs[17].substring(0, other_imgs[17].indexOf('key=') + 5) : '');
                      }
                  }
                  catch (e) {
                      console.log('Dataresult ERROR: ' + e);
                  }
                  
              
             

              await page.waitFor(1000);
                  try {
                      await page.waitForSelector('#imgview div div.modal-header button', { timeout: 1000 })
                      await page.click("#imgview div div.modal-header button");
                  }
              catch { }

              await page.waitFor(1000);

             
                  //start ChassisNo
                  
                  if (arr.length > 1) {
                   
                  Dataresult[count].ChassisNo = arr[arr.length - 1];
                  } else {
                  
                    Dataresult[count].ChassisNo = arr[0];
                  }

                  // end ChassisNo

                  //start Model
                  if (ChassisNo.length > 2)
                  {
                    var arrModel = ChassisNo[ChassisNo.length - 2].split(' '); 
                   
                      if (arrModel.length == 3)
                      {
                        Dataresult[count].Model = arrModel[0] + " " + arrModel[1];
                        
                      } else {
                        Dataresult[count].Model = arrModel[0];
                      }
                  } else {
                    if (arr.length == 3)
                    {
                      Dataresult[count].Model = arr[0] + " " + arr[1];
                    } else {
                      Dataresult[count].Model = arr[0];
                    }

                    
                  }
                  //End Model

                  //start for debug
                  count = count + 1;
                  

                   
                    let code = Buffer.from(new Date().toLocaleDateString()).toString('base64');

                      console.log('converting');
                      console.log(Dataresult);
                    var json = {
                        vehicle: JSON.stringify(Dataresult),
                        code: code,
                        idlog: IDLog
                      };

                      
                    await SaveData(json);

                    Dataresult = [];
                    count = 0;
                   
               
                  //end for debug
              } catch (error) {
                  console.log("Error: ", error);
                  idv_all = idv_all.filter(function (n) { return n; });
                  console.log(JSON.stringify(idv_all));
                  //fs.writeFileSync('saved-idvehicles/' + 'priority.txt', JSON.stringify(idv_all));
                  await browser.close();
                  process.exit()
                 
              }
                  
                  
              } //End VehicleCount loop
            
      }
      
  } catch (e) {
    let filename = new Date().toLocaleDateString().replace(/\//g, '-') + ' ' + new Date().toLocaleTimeString().replace(/:/g, '-');
        //console.log("Error: ", e);
        fs.writeFileSync('Dealer-log/' + filename+'.txt', e);

        await SaveLogData(e,IDLog)

        await browser.close();
        process.exit()
    
  }
  finally {
    //await browser.close();
    //process.exit()
  }
})()


function wait (ms) {
  return new Promise(resolve => setTimeout(() => resolve(), ms));
}

    




