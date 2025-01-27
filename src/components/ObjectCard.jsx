const ObjectCard = ({object, fields}) => {
    return (
        <div className="obj-card">
            <h3>{object}</h3>
            {fields.map((field) => {return <p>{field}</p>})}
        </div>
    )
  };

  export default ObjectCard