export async function getAllClasses() {
  const headers = new Headers();

  headers.append('Api-Key', 'K1Abro71Qy58KFoA5io9uYvf');
  headers.append('Api-Version', '1.25');
  headers.append('Timezone', 'Central Time (US & Canada)');
  headers.append('Content-Type', 'application/json');

  const response = await fetch('https://api.getgalore.com/v1/events', {
    method: 'GET',
    headers: headers,
  });

  const classes = await response.json();
  console.log(classes);
  return classes.series;
}
