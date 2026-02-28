import urllib.request, json, time

# Fetch summary from Wikipedia REST API

def fetch(title):
    url = f'https://en.wikipedia.org/api/rest_v1/page/summary/{title}'
    req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.load(resp)
            return data.get('extract') or ''
    except Exception:
        return None

with open('lang.json') as f:
    data = json.load(f)

updated = 0
for entry in data['languages']:
    name = entry['name']
    if entry['info'] and not entry['info'].startswith('Description for'):
        continue
    if name == 'Igbo':
        continue
    titles = [name.replace(' ', '_') + '_language', name.replace(' ', '_')]
    summary = None
    for t in titles:
        s = fetch(t)
        if s:
            summary = s
            break
        time.sleep(0.1)
    if summary:
        entry['info'] = summary
    else:
        entry['info'] = 'No summary found; please supply manually.'
    updated += 1
    time.sleep(0.1)

with open('lang.json','w') as f:
    json.dump(data, f, indent=2)

print('done, updated', updated)