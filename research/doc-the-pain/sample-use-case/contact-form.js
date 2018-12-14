import React from 'react'

const fieldsetStyle = {
  display: 'inline-block',
  borderRadius: '0.8em',
  margin: '0px',
  padding: '0px',
  width: '90%',
}

const fieldStyle = {
  margin: '0.3em',
  padding: '0.3em',
  fontSize: '1rem',
  height: '2em',
  textAlign: 'center'
}

const TextField = ({ name, label: text, style: css }) => {
  return (
    <label style={css} htmlFor={name}>
      {text}
      <input style={css} type="text" name={name} />
    </label>
  );
}

class ContactForm extends React.Component {
  handleSubmit = (e) => {
    e.preventDefault()
    const data = new FormData(e.target)

    fetch('https://httpbin.org/post', {
      method: 'POST',
      body: data,
    })
  }

  render() {
    let { banner, thanks, inform } = this.props;
    return (
      <div>
        <h4>{banner}</h4>
        <form onSubmit={this.handleSubmit}>
          <fieldset style={fieldsetStyle}>
            <TextField style={fieldStyle} name="firstname" label="First Name" />
            <TextField style={fieldStyle} name="email" label="Email" />
            <button style={fieldStyle}>Submit</button>
          </fieldset>
        </form>
        <h5>{inform}</h5>
      </div>
    )
  }
}

export default ContactForm