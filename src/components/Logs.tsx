import { Log } from '../game/types';

const fetchDictionaryEntry = async(word:string) => {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
  const data = await response.json();
  const definitions:string[] = [];
  let numShownDefinitions = 0;
  let numTotalDefinitions = 0;

  if (response.status === 200) {
    data.forEach((entry:any) => {
      entry.meanings.forEach((meaning:any) => {
        numTotalDefinitions += meaning.definitions.length;
        numShownDefinitions++;
        definitions.push(`${meaning.partOfSpeech}: ${meaning.definitions[0].definition}`);
      });
    });
  } else {
    definitions.push('Error: no definitions found! Either the definition is really obscure, or the dictionary API errored out.')
    definitions.push('');
    definitions.push('You may want to consult a specific Scrabble dictionary (this project uses the twl06 word list).');
  }

  alert([
    word,
    ...definitions,
    '',
    `Showing ${numShownDefinitions}/${numTotalDefinitions} definitions.`,
    'Source: Free Dictionary API: https://dictionaryapi.dev/'
  ].join('\n'));
};

const LogPlayerText = ({ turn }:{ turn:number }) => (
  <span style={{ color: turn % 2 === 0 ? 'red' : 'seagreen' }}>
    {turn % 2 === 0 ? 'AI' : 'Player'}
  </span>
);

export const Logs = ({ logs }:{ logs:Log[] }) => (
  <div className='logs'>
    {logs.map((log, index) => {
      let logComponent = null;
      if (log.action === 'move') {
        logComponent = (
          <div key={index} className='log'>
            <span className='bold'>Turn {log.turn}: </span>
            <LogPlayerText turn={log.turn} /> played {log.words.map((i, index) => (
              <span key={index}>
                <span
                  className='dictionary_api_connected_word'
                  onClick={() => fetchDictionaryEntry(i.word)}
                >
                {i.word}
                </span>
                <span> ({i.score} pts){index === log.words.length - 1 ? ' = ' : ' + '}</span>
              </span>
            ))}
            ({log.score} pts)
          </div>
        );
      } else if (log.action === 'pass') {
        logComponent = (
          <div key={index} className='log'>
            <span className='bold'>Turn {log.turn}:</span> <LogPlayerText turn={log.turn} /> passed.
          </div>
        );
      }
      return logComponent;
    })}
  </div>
);
