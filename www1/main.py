import requests
from bs4 import BeautifulSoup
from googlesearch import search

response = requests.get('https://www.tiobe.com/tiobe-index/')
soup = BeautifulSoup(response.text, 'html.parser')
par = soup.find('table', {"class": "table table-striped table-top20"}).findAll('tr')
par.pop(0)
langs = []
for p in par:
    cells = p.findAll('td')
    langs.append(cells[4].text)
print(langs)
page = 'page/'
with open(page + 'index.md', 'w') as f:
    f.write('# Strona główna, tymczasowa\n[link do listy](langs.md)')
with open(page + "langs.md", "w") as f:
    f.write("# Top 20 języków programowania\n___"
            "![Logo](https://doko.mimuw.edu.pl/public/assets/doko-core/img/mimuw.png)___\n")
index = 1
for lang in langs:
    print(lang)
    with open(page + "langs.md", "a") as f:
        filename = 'lang' + str(index) + '.md'
        f.write(str(index) + '. [' + lang + '](' + filename + ')\n')
        with open(page + filename, 'w') as fsub:
            fsub.write("# " + lang)
            for url in search(lang + " programming Wikipedia", stop=1, pause=5.0):
                response = requests.get(url)
                soup = BeautifulSoup(response.text, 'html.parser')
                img = soup.find('a', {'class': 'mw-file-description'}).find('img')
                fsub.write('\n![Logo](https:' + img['src'] + ')\n')
                par = soup.findAll('p')
                left = 3
                for p in par:
                    if p.text != '' and p.text != '\n':
                        fsub.write('\n' + p.text)
                        left = left - 1
                        if left == 0:
                            break
                fsub.write('\nRead more on [Wikipedia](' + url + ')')
    index = index + 1
