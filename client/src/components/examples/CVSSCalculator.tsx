import { CVSSCalculator } from '../CVSSCalculator'

export default function CVSSCalculatorExample() {
  return (
    <div className="max-w-4xl">
      <CVSSCalculator 
        onChange={(vector, score, severity) => {
          console.log('CVSS Update:', { vector, score, severity });
        }}
      />
    </div>
  )
}