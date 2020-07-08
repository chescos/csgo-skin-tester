const Paintkit = require('../database/models/Paintkit');

exports.index = async (req, res) => {
  const painkits = await Paintkit.query()
    .orderBy('id', 'asc');

  const result = painkits.map((painkit) => ({
    id: painkit.id,
    name: painkit.name,
    name_technical: painkit.name_technical,
    defindex: painkit.defindex,
  }));

  return res.status(201).json({
    paintkits: result,
  });
};
