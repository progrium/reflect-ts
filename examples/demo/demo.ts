import * as reflect from '../../gen/reflect.ts';

// @Hack: polyfill for Deno __filename
if (typeof __filename === 'undefined')
{
  window['__filename'] = new URL('', import.meta.url).href.slice('file:///'.length);
}

export class Entity {
  lifeSatisfaction: number;
};
reflect.Type(Entity, __filename);

export class Player extends Entity {
  happinessLevel: number;
};
reflect.Type(Player, __filename);


if (typeof window.fetch !== 'undefined')
{
    fetch('/schema.json')
        .then((resp) => resp.json())
        .then((json) => {
            const schema = reflect.loadSchema(json);

            const t = schema.TypeOf(Player);
            console.log({ t });
        });
}