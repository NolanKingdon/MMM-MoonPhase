# MMM-MoonPhase

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Displays the realtime moonphase and increments the shadow daily.

![Demo Image](https://github.com/NolanKingdon/MMM-MoonPhase/blob/master/images/2019-06-22-example-moons.png)

## Using the module



To install this module, navigate into `~/MagicMirror/modules` and type the following commands:
```
git clone https://github.com/NolanKingdon/MMM-MoonPhase
cd MMM-MoonPhase
npm install

```

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
var config = {
    modules: [
        {
			module: "MMM-MoonPhase",
			position: "top_center",
			config: {
				updateInterval: 43200000,
				hemisphere: "N",
				resolution: "detailed",
				basicColor: "white",
				title: true,
				phase: true,
				x: 200,
				y: 200,
				alpha: 0.7
			}
		},
    ]
}
```

## Configuration options

| Option           | Description                                       | Default              | Possible
|----------------- |---------------------------------------------------|----------------------|-----------
| `updateInterval` | *Optional* Miliseconds between updates            | `43200000` (12 hours)| any
| `hemisphere`     | *Optional* Your location on the earth             | `"N"` (North)        | "N"/"S"
| `resolution`     | *Optional* Use detailed moon image or basic circle| `"detailed"`         | "detailed"/"basic"
| `basicColor`     | *Optional* Color of moon if using basic resolution| `"white"`            | any valid css color
| `title`          | *Optional* Toggle module title                    | `true`               | true/false
| `phase`          | *Optional* Toggle phase label                     | `true`               | true/false
| `x`              | *Optional* Width (recommended <300)               | `200`                | >0
| `y`              | *Optional* Height (recommended <300)              | `200`                | >0
| `alpha`          | *Optional* Visibility of dark side of moon        | `1` (Invisible)      | >=0 to <= 1

