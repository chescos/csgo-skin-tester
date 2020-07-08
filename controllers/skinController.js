const Skin = require('../database/models/Skin');

exports.index = async (req, res) => {
  const skins = await Skin.query()
    .orderBy('id', 'asc')
    .withGraphFetched({
      item: true,
      paintkit: true,
    });

  const result = skins.map((skin) => ({
    id: skin.id,
    name: skin.name,
    name_technical: skin.name_technical,
    image_url: skin.image_url,
    item: {
      id: skin.item.id,
      name: skin.item.name,
      name_technical: skin.item.name_technical,
      defindex: skin.item.defindex,
      image_url: skin.item.image_url,
      class: skin.item.class,
      type: skin.item.type,
    },
    paintkit: {
      id: skin.paintkit.id,
      name: skin.paintkit.name,
      name_technical: skin.paintkit.name_technical,
      defindex: skin.paintkit.defindex,
    },
  }));

  return res.status(201).json({
    skins: result,
  });
};
