import { FileUploadZone } from '../FileUploadZone'

export default function FileUploadZoneExample() {
  return (
    <div className="max-w-2xl">
      <FileUploadZone
        onFilesAdded={(files) => {
          console.log('Files added:', files.map(f => f.file.name));
        }}
        maxFiles={5}
      />
    </div>
  )
}