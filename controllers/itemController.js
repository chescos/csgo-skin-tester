const Item = require('../database/models/Item');

exports.index = async (req, res) => {
  const items = await Item.query()
    .orderBy('id', 'asc');

  const result = items.map((item) => ({
    id: item.id,
    name: item.name,
    name_technical: item.name_technical,
    defindex: item.defindex,
    image_url: item.image_url,
    class: item.class,
    type: item.type,
  }));

  return res.status(201).json({
    items: result,
  });
};
