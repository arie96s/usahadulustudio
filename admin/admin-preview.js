// Register Preview untuk Blog/Case Study
CMS.registerPreviewTemplate("blog", createClass({
  render: function() {
    const entry = this.props.entry;
    const title = entry.getIn(['data', 'title']);
    const date = entry.getIn(['data', 'date']);
    const category = entry.getIn(['data', 'category']);
    const image = this.props.getAsset(entry.getIn(['data', 'image']));
    const body = this.props.widgetFor('body');

    return h('div', { style: { background: '#000', color: '#fff', padding: '40px', fontFamily: 'Inter, sans-serif' } },
      h('span', { style: { border: '1px dashed #555', padding: '4px 10px', fontSize: '10px', letterSpacing: '2px' } }, category),
      h('h1', { style: { fontSize: '32px', fontWeight: '900', marginTop: '20px', textTransform: 'uppercase' } }, title),
      h('p', { style: { color: '#666', fontSize: '12px' } }, date),
      image ? h('img', { src: image.toString(), style: { width: '100%', marginTop: '20px', borderRadius: '12px', border: '1px solid #222' } }) : null,
      h('div', { style: { marginTop: '30px', lineHeight: '1.6', fontSize: '16px', color: '#ccc' } }, body)
    );
  }
}));