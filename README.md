# cinewatch-api

The Cinewatch API acts as a middle-ground between cinema listings pages and the Cinewatch app. At the moment, the project only supports Cineworld, and because Cineworld don't have an API, this project uses `puppeteer` to read the details from the Cineworld website and parse it into a more API-like response.

## Sample response

A sample response might look as follows:

```json
{
	"data": {
		"branch": {
			"name": "Ashton-under-Lyne",
			"description": "Cineworld Ashton is a great 14 screen cinema, with local transport links, Starbucks and a wide range of restaurants nearby.",
			"dates": [
				{
					"day": "Today",
					"date": "2025-10-15"
				},
				{
					"day": "Thu",
					"date": "2025-10-16"
				},
				{
					"day": "Fri",
					"date": "2025-10-17"
				},
				{
					"day": "Sat",
					"date": "2025-10-18"
				},
				{
					"day": "Sun",
					"date": "2025-10-19"
				},
				{
					"day": "Mon",
					"date": "2025-10-20"
				},
				{
					"day": "Tue",
					"date": "2025-10-21"
				}
			],
		},
		"films": [
			{
				"title": "Tron: Ares",
				"poster": {
					"url": "https://regalcdn.azureedge.net/CW/TronAres/HO00013436/TV_SmallPosterImage/20251006-100039583.jpg"
				},
				"details_url": "https://www.cineworld.co.uk/films/tron-ares/ho00013436#/buy-tickets-by-film?in-cinema=068&at=2025-10-15&for-movie=ho00013436&view-mode=list",
				"rating": {
					"url": "https://www.cineworld.co.uk/xmedia/img/10108/rating/12A.png",
					"alt": "No-one younger than 12 may see a '12A' film in a cinema unless accompanied by an adult. Responsibility for allowing under-12s to view lies with the accompanying or supervising adult."
				},
				"genre": "Action",
				"duration_minutes": 119,
				"screenings": [
					{
						"label": "2D",
						"subtitled": false,
						"times": [
							{
								"start": {
									"label": "15:40",
									"value": "2025-10-15T14:40:00.000Z"
								},
								"end": {
									"label": "17:39",
									"value": "2025-10-15T16:39:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277744&lang=en"
							},
							{
								"start": {
									"label": "17:00",
									"value": "2025-10-15T16:00:00.000Z"
								},
								"end": {
									"label": "18:59",
									"value": "2025-10-15T17:59:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277751&lang=en"
							},
							{
								"start": {
									"label": "18:40",
									"value": "2025-10-15T17:40:00.000Z"
								},
								"end": {
									"label": "20:39",
									"value": "2025-10-15T19:39:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277755&lang=en"
							},
							{
								"start": {
									"label": "20:00",
									"value": "2025-10-15T19:00:00.000Z"
								},
								"end": {
									"label": "21:59",
									"value": "2025-10-15T20:59:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277750&lang=en"
							}
						]
					},
					{
						"label": "IMAX 2D",
						"subtitled": false,
						"times": [
							{
								"start": {
									"label": "16:20",
									"value": "2025-10-15T15:20:00.000Z"
								},
								"end": {
									"label": "18:19",
									"value": "2025-10-15T17:19:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277747&lang=en"
							}
						]
					},
					{
						"label": "4DX 3D",
						"subtitled": false,
						"times": [
							{
								"start": {
									"label": "17:40",
									"value": "2025-10-15T16:40:00.000Z"
								},
								"end": {
									"label": "19:39",
									"value": "2025-10-15T18:39:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277754&lang=en"
							},
							{
								"start": {
									"label": "20:40",
									"value": "2025-10-15T19:40:00.000Z"
								},
								"end": {
									"label": "22:39",
									"value": "2025-10-15T21:39:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277753&lang=en"
							}
						]
					},
					{
						"label": "IMAX 3D",
						"subtitled": false,
						"times": [
							{
								"start": {
									"label": "19:20",
									"value": "2025-10-15T18:20:00.000Z"
								},
								"end": {
									"label": "21:19",
									"value": "2025-10-15T20:19:00.000Z"
								},
								"booking_url": "https://experience.cineworld.co.uk/select-tickets?sitecode=068&site=068&id=277748&lang=en"
							}
						]
					}
				]
			}
		]
	}
}
```
