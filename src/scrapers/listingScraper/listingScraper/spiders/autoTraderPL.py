import scrapy
from datetime import datetime


class AutotraderplSpider(scrapy.Spider):
    name = "autoTraderPL"
    allowed_domains = ["autotrader.pl", "www.autotrader.pl"]
    start_urls = [
        f"https://www.autotrader.pl/szukaj/osobowe/str-{i}?nowe=nie"
        for i in range(2, 333)  # Example: pages 1–2
    ]# MAX PAGE = 333

    def parse(self, response):
        """Parse search result pages and extract listings"""

        listings = response.css("div.offer-card")
        self.logger.info(f"Found {len(listings)} listings on {response.url}")

        for listing in listings:
            try:
                title = listing.css("h2::text").get(default="").strip()
                details = listing.css("div.offer-card__basic p::text").get(default="").strip()

                price = listing.css("div.offer-card__price strong::text").get(default="").strip()
                link = listing.css("a::attr(href)").get(default="").strip()

                # footer details
                year = listing.css("div.offer-card__details span[title]::attr(title)").re_first(r"\d{4}")
                mileage = listing.css("div.offer-card__details span.offer-detail::text").re_first(r"[\d\s]+ km")
                fuel_type = listing.css("div.offer-card__details span.offer-detail::text").re_first(r"(benzyna|diesel|hybryda|elektryczny)")

                # clean fields
                clean_price = price.replace("PLN", "").replace(" ", "").strip() if price else "0"
                mileage_number = "".join(filter(str.isdigit, mileage)) if mileage else "0"

                yield {
                    "title": title,
                    "make": title.split()[0] if title else "",
                    "model": " ".join(title.split()[1:]) if len(title.split()) > 1 else "",
                    "year": year,
                    "trim": details,
                    "price": clean_price,
                    "currency": "PLN",
                    "mileage": mileage_number,
                    "mileage_unit": "km",
                    "region": listing.css("span.offer-detail--city::attr(title)").get(default=""),
                    "transmission": "",  # Not present in snippet
                    "fuelType": fuel_type,
                    "source": "autotrader.pl",
                    "link": response.urljoin(link),
                    "scraped_at": datetime.utcnow().isoformat(),
                    "manual_review": 0,
                }
            except Exception as e:
                self.logger.error(f"Error parsing listing: {e}")
