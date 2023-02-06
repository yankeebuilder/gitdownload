import React from 'react';


const Header = () => {
    return (
        <header style={headerStyle}>
            <h1>gitdownload</h1>
            <h4> download everything from git repository</h4>
        </header>
    )
};

const headerStyle = {
    background: "#333",
    color: '#fff',
    textAlign: 'center',
    padding: '10px'
};



export default Header;