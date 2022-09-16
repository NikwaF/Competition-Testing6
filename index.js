const fs = require('fs');

const fetch = require('node-fetch');
const cheerio = require('cheerio');
const bulan_angka = {January: "01",February: "02",September:"09"}


const getpage = () => new Promise((resolve,reject) => {
  fetch('https://tradingeconomics.com/calendar', {
    method: 'GET'
  })
  .then(async res => {
    const $ = cheerio.load(await res.text());
    const hasil = {};

    $('.table-header').each(function(e,i) {
      const tgl = $(this).find('tr>th[colspan="3"]').text().trim();
      const tgl_split = tgl.split(" ");
      const susun_tgl = `${bulan_angka[tgl_split[1]]}-${tgl_split[2]}-${tgl_split[3]}` 
      const tumpuk = [];
      let timebefore = "";

      $(this).next().next().children().each(function(a,j){
        let time = $(this).find('td:nth-child(1)>span').text().trim();
        const title = `${$(this).find('td:nth-child(3) > a').text().trim()} ${$(this).find('td:nth-child(3) > span').text().trim()}`;
        const metaData = {
          country: $(this).attr('data-country'),
          actual: $(this).find('td:nth-child(4) > a > span').text().trim(),
          previous: $(this).find('td:nth-child(5) >  span#previous').text().trim(),
          consensus: $(this).find('td:nth-child(6) >  a').text().trim(),
          forecast: $(this).find('td:nth-child(7) >  a').text().trim()
        };

        if(time == "")
        {
          time = timebefore;
        }

        tumpuk.push({time, title, metaData })
        
        if(time != "")
        {
         timebefore = time;
        }
      });

      hasil[susun_tgl] = tumpuk;
    });
    resolve(hasil);
  })
    .catch(err => reject(err))
});


(async () => {
  const page = await getpage();
  
  fs.writeFile("./data.json", JSON.stringify(page, null, 4), 'utf8', function (err) {
    if (err) {
        console.log("An error occured while writing JSON Object to File.");
        return console.log(err);
    }
 
    console.log("JSON file has been saved.");
});
 
})();