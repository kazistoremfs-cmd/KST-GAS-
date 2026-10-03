const shortUrl = 'https://forms.gle/bFaf2UnDRDenRRkv5';
async function run() {
  const res = await fetch(shortUrl);
  const data = await res.text();
  const actionMatch = data.match(/<form action="(https:\/\/docs\.google\.com\/forms\/[^"]+\/formResponse)"/);
  console.log('Form Action:', actionMatch ? actionMatch[1] : 'Not found');
  const loadDataMatch = data.match(/var FB_PUBLIC_LOAD_DATA_ = (\[.*\]);/);
  if (loadDataMatch) {
    const parsed = JSON.parse(loadDataMatch[1]);
    const fields = parsed[1][1];
    fields.forEach(f => {
      if (f[4] && f[4][0] && f[4][0][0]) {
        console.log(`Field Name: ${f[1]}, Entry ID: entry.${f[4][0][0]}`);
      }
    });
  }
}
run();
