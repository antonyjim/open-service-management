import * as React from 'react'
import { Table } from './Table/Table'

export function TableList(props) {
  return (
    <div className='mt-3'>
      <Table table={props.match.params.table} showSearch={true} />
    </div>
  )
}
