const { Command } = require('commander');

const program = new Command();

const commands = [
  {
    name: 'skins:update',
    description: 'Parses all CS:GO skins from the game files and updates them in the database.',
    file: 'skins/update',
  },
  {
    name: 'account:create',
    description: 'Add a new Steam account to the database.',
    file: 'account/create',
  },
  {
    name: 'account:destroy',
    description: 'Remove an existing Steam account from the database.',
    file: 'account/destroy',
  },
];

commands.forEach((command) => {
  program.command(command.name, command.description, {
    executableFile: `./commands/${command.file}.js`,
  });
});

program.parse(process.argv);
