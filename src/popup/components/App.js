import React from 'react'
import { Tablist, Tab } from 'evergreen-ui'
import SyntaxHighlighter, { registerLanguage } from 'react-syntax-highlighter/dist/light'
import js from 'react-syntax-highlighter/dist/languages/javascript'
import syntaxStyle from './syntaxStyle'
import styles from './App.css'

registerLanguage('javascript', js)

const tabs = ['Nightmare', 'Puppeteer', 'Cypress']

const App = ({ onSelectTab, selectedTab, onRestart, recording }) => {
  let script = ''
  if (selectedTab === 'Nightmare') {
    script = getNightmare(recording)
  } else if (selectedTab === 'Puppeteer') {
    script = getPuppeteer(recording)
  } else if (selectedTab === 'Cypress') {
    script = getCypress(recording)
  }

  return (
    <div>
      <Tablist marginX={-4} marginBottom={16} textAlign='center'>
        {tabs.map((tab, index) => (
          <Tab
            key={tab}
            id={tab}
            isSelected={tab === selectedTab}
            onSelect={() => onSelectTab(tab)}
            aria-controls={`panel-${tab}`}
          >
            {tab}
          </Tab>
        ))}
      </Tablist>

      <SyntaxHighlighter language='javascript' style={syntaxStyle}>
        {script}
      </SyntaxHighlighter>

      <button className={styles.button} onClick={onRestart}>Restart</button>
    </div>
  )
}

function getNightmare (recording) {
  return `const Nightmare = require('nightmare')
const nightmare = Nightmare({ show: true })

nightmare
${recording.reduce((records, record, i) => {
  const { action, url, selector, value } = record
  let result = records
  if (i !== records.length) result += '\n'

  switch (action) {
    case 'keydown':
      result += `.type('${selector}', '${value}')`
      break
    case 'click':
      result += `.click('${selector}')`
      break
    case 'goto':
      result += `.goto('${url}')`
      break
    case 'reload':
      result += `.refresh()`
      break
  }

  return result
}, '')}
.end()
.then(function (result) {
  console.log(result)
})
.catch(function (error) {
  console.error('Error:', error);
});`
}

function getPuppeteer (recording) {
  return `const puppeteer = require('puppeteer')

(async () => {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
${recording.reduce((records, record, i) => {
  const { action, url, selector, value } = record
  let result = records
  if (i !== records.length) result += '\n'

  switch (action) {
    case 'keydown':
      result += `  await page.type('${selector}', '${value}')`
      break
    case 'click':
      result += `  await page.click('${selector}')`
      break
    case 'goto':
      result += `  await page.goto('${url}')`
      break
    case 'reload':
      result += `  await page.reload()`
      break
  }

  return result
}, '')}
  await browser.close()
})()`
}

function getCypress (recording) {
  return `    cy.visit('START_URL')

${recording.reduce((records, record, i) => {
  const { action, url, selector, value } = record
  let result = records
  if (i !== records.length) result += '\n'

  switch (action) {
    case 'keydown':
      result += `    cy.get('${selector}').type('${value}')`
      break
    case 'click':
      result += `    cy.get('${selector}').click()`
      break
    case 'goto':
      //result += `    cy.visit('${url}')`
      result += `    // goto ${url}`
      break
    case 'reload':
      result += `    cy.reload()`
      break
  }

  return result
}, '')}
`
}

export default App
