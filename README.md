# MMM-MoonPhase

This is a module for the [MagicMirror²](https://github.com/MichMich/MagicMirror/).

Todo: Insert description here!

## Using the module

To use this module, add the following configuration block to the modules array in the `config/config.js` file:
```js
var config = {
    modules: [
        {
            module: 'MMM-MoonPhase',
            config: {
                // See below for configurable options
            }
        }
    ]
}
```

## Configuration options

| Option           | Description                                       | Default
|----------------- |---------------------------------------------------|----------
| `updateInterval` | *Optional* Miliseconds between updates            | `43200000` (12 hours)
| `hemisphere`     | *Optional* Your location on the earth             | `"N"` (Northern Hemisphere)
| `resolution`     | *Optional* Use detailed moon image or basic circle| `"detailed"`
| `basicColor`     | *Optional* Color of moon if using basic resolution| `"white"`
| `title`          | *Optional* Toggle module title                    | `true` 
| `phase`          | *Optional* Toggle phase label                     | `true` 
| `x`              | *Optional* Width                                  | `200`
| `y`              | *Optional* Height                                 | `200`
| `alpha`          | *Optional* Visibility of dark side of moon        | `0.9` Slightly visible under shadow

		updateInterval: 43200000, // Every Twelve hours
		hemisphere: "N", //N or S
		resolution: "detailed", // detailed Or basic
		basicColor: "white", // "#ffffbe" is a good one
		title: true, //Whether or not the Moon Phase Title is displayed
		phase: true, //Label for what moon phase it is
		x: 200, // x dimension
		y: 200, // y dimension - I really recommend this staays the same as x, but whatever, go nuts
		alpha: 0.9 // not yet implemented - visibility of the moon behind the shadow - 1 is fully blacked out
