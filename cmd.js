const { Command } = require('commander');

const program = new Command();

const commands = [
  {
    name: 'skins:update',
    description: 'Parses all CS:GO skins from the game files and updates them in the database.',
    file: 'skins/update',
  },
];

commands.forEach((command) => {
  program.command(command.name, command.description, {
    executableFile: `./commands/${command.file}.js`,
  });
});

program.parse(process.argv);
