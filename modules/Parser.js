const _ = require('lodash');

class Parser {
  static get exteriors() {
    return [
      'Factory New',
      'Minimal Wear',
      'Field-Tested',
      'Well-Worn',
      'Battle-Scarred',
    ];
  }

  static get wears() {
    return {
      'Factory New': { min: 0.01, max: 0.07 },
      'Minimal Wear': { min: 0.07, max: 0.15 },
      'Field-Tested': { min: 0.15, max: 0.37 },
      'Well-Worn': { min: 0.37, max: 0.44 },
      'Battle-Scarred': { min: 0.44, max: 1.00 },
    };
  }

  static isStattrak(marketHashName) {
    return marketHashName.includes('StatTrak™');
  }

  static marketHashNameToExterior(marketHashName) {
    return _.find(
      this.exteriors,
      (exterior) => marketHashName.includes(exterior),
    );
  }

  static marketHashNameToWear(marketHashName) {
    return _.get(
      this.wears,
      [this.marketHashNameToExterior(marketHashName), 'min'],
    );
  }

  static marketHashNameToSkinName(marketHashName) {
    const replaceStrings = [
      'StatTrak™',
      'Souvenir',
      '★',
    ];

    this.exteriors.forEach((exterior) => {
      replaceStrings.push(`(${exterior})`);
    });

    let result = marketHashName;

    replaceStrings.forEach((replaceString) => {
      result = result.replace(replaceString, '');
    });

    return result.trim();
  }
}

module.exports = Parser;
