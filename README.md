# MMM-MoonPhase

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Displays the realtime moonphase and increments the shadow daily.

![Demo Image](https://github.com/NolanKingdon/MMM-MoonPhase/blob/master/images/2019-06-22-example-moons.png)

## Using the module

To install this module, navigate into `~/MagicMirror/modules` and type the following commands:

```sh
git clone https://github.com/NolanKingdon/MMM-MoonPhase
```

To use this module, add the following configuration block to the modules array in the `config/config.js` file:

```js
let config = {
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
				alpha: 0.7,
                riseAndSet: {
                    display: false,
                    lon: -80.0,
                    lat: 40.0,
                    gmtOffset: -3.0
                }
			}
		},
	]
}
```

## Configuration options

| Option           | Description                                       | Default              | Possible
|----------------- |---------------------------------------------------|----------------------|-----------
| `updateInterval` | *Optional* Miliseconds between updates            | `43200000` (12 hours)| any number
| `hemisphere`     | *Optional* Your location on the earth             | `"N"` (North)        | `"N"`/`"S"`
| `resolution`     | *Optional* Use detailed moon image or basic circle| `"detailed"`         | `"detailed"`/`"basic"`
| `basicColor`     | *Optional* Color of moon if using basic resolution| `"white"`            | any valid css color
| `title`          | *Optional* Toggle module title                    | `true`               | `true`/`false`
| `phase`          | *Optional* Toggle phase label                     | `true`               | `true`/`false`
| `age`            | *Optional* Number of days for the current phase   | `false`              | `true`/`false`
| `x`              | *Optional* Width (recommended <300)               | `200`                | `>0`
| `y`              | *Optional* Height (recommended <300)              | `200`                | `>0`
| `alpha`          | *Optional* Visibility of dark side of moon        | `0.8` (Transparent)  | `>=0` to `<= 1`
| `riseAndSet`     | *Optional* Config group for moon rise and set times | See below          | See below

### Moon Rise/Set Options
Moon rise and set time options are contained within a sub-section of the config (See 'Using the module' example).

Unlike the above config options these configs are not all optional should you enable the display of the moon rise/set times - hence their separation into a separate config object.

If you only provide some of the configs within the `riseAndSet` object when this feature is enabled via the `display` option, the time calculation will be off by large amounts of time.

| Option | Description |
|--------|-------------|
| `display` | *Optional* Whether or not to run the calculation for the moon rise and set times. Runs at the same interval specified by `updateInterval` in the normal config options. |
| `lon` | *Required if `display` is `true`* Your longitude. Used as part of the calculation |
| `lat` | *Required if `display` is `true`* Your lattitude. Used as part of the calculation |
| `gmtOffset` | *Required if `display` is `true`* The amount of hours **as a decimal** your timezone is behind GMT. For example to represent EST (No DST) you would enter -4.0. |

