/*
   This is a little script to run from cron, to keep a subdomain
   updated with a dynamic IP address. That way I can ssh into my
   home using a constant subdomain, and not have to worry if my
   ISP have changed my IP.
*/

const https = require('https');

https.get('https://api.ipify.org?format=json', (res) => {

   let body = "";
   res.on("data", (chunk) => {
      body += chunk;
   });

   res.on("end", () => {
      try {
         let json = JSON.parse(body);

         // Configure me!
         const hostName     = 'kryten';    // DNS hostname
         const domainId     = '666';       // Domain ID in Linode
         const recordId     = '123';       // DNS record ID in Linode
         const linodeAPIKey = 'your_linode_api_key';

         const updateRecord = {
            "name": hostName,
            "target": json.ip,
            "priority": 0,
            "weight": 0,
            "port": 0,
            "service": null,
            "protocol": null,
            "ttl_sec": 300,
            "tag": null
         };

         const options = {
            hostname: 'api.linode.com',
            port: 443,
            path: `/v4/domains/${domainId}/records/${recordId}`,
            method: 'PUT',
            headers: {
               'Content-Type': 'application/json',
               'Authorization': 'Bearer '+linodeAPIKey
            }
         };

         callback = function(response) {
            var str = ''
            response.on('data', function(chunk){
               str += chunk
            })
            response.on('end', function(){
               console.log(str)
            })
         };

         https.request(options, callback).end(JSON.stringify(updateRecord));

      } catch (error) {
         console.error(error.message);
      };

   });

}).on("error", (error) => {
   console.log(error.message);
});
