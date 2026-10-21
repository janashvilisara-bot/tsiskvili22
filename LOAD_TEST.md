# დატვირთვის ტესტი (k6)

1. დააინსტალირეთ k6: https://k6.io/docs/get-started/installation/
2. აპში შედით სატესტო ანგარიშით, აიღეთ access token (ბრაუზერის DevTools → Application → Local Storage).
3. გაუშვით:
   ```
   k6 run -e USERS=200 -e ANON_KEY=<საჯარო გასაღები> -e TOKEN=<token> scripts/load-test/k6-200-users.js
   ```
   300 ან 400-ისთვის შეცვალეთ `USERS`.
4. სცენარი: 2 წუთში 0→N მომხმარებელი, 3 წუთი შენარჩუნება. მხოლოდ კითხვის მოთხოვნები.
5. შედეგი: „✓ http_req_duration p(95)<1000" და „✓ http_req_failed rate<0.01" = უძლებს.

გაუშვით სამუშაო საათების გარეთ.
