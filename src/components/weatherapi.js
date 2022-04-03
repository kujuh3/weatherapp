import React from 'react';
import {makeStyles} from "@material-ui/styles";
import {useEffect, useState} from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import {Grid, Container} from '@material-ui/core';
import List from "@material-ui/core/List"
import ListItem from "@material-ui/core/ListItem"
import {TextField, Button} from '@material-ui/core';
import {Dialog, DialogTitle, DialogContent, DialogActions} from '@material-ui/core';

//varoitusta varten tietojen haku
function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props}/>;
}


const useStyles = makeStyles({
    listaus : {
            borderBottom : "solid 1px #ccc",
            paddingBottom : "10px",
            marginBottom : "10px",
            backgroundColor : "#c8c6a7",
            color : "white",
            fontWeight : "bold",
            minHeight : "90%",
            wordWrap : "anywhere",
            borderRadius : "40px",
            },
    listausotsikko : {
            fontVariant : "all-petite-caps",
            fontSize : "130%",
            backgroundColor : "#92967d",
            marginBottom : "10px",
            color : "white",
            borderRadius : "40px",
            display : "block",
            textAlign : "center"
            },
    nappi : {
          borderBottom : "solid 1px #ccc",
          paddingBottom : "10px",
          marginBottom : "10px",
          marginTop : "10px",
          backgroundColor : "#92967d",
          color : "white",
          fontWeight : "bold",
          },
   tausta : {
          backgroundColor : "#d6e2ff",
          borderRadius : "5px",
          border : "solid 2px #00000073"
          },
    root : {
          marginLeft : "4px",     
          },
    listgrid : {
          paddingRight : "8px",
          },
    
});

//funktiolla props jonka kautta haun teko
function Saat(props){

const [dialogiShow, setDialogiShow] = useState(false);
const [haettava, setHaettava] = useState("Seinajoki");
const [hakeminen, setHakeminen] = useState("Seinajoki");
const [tuplat, setTuplat] = useState(false);
  //ääkkösien määrääminen vertausta varten
  const [umlauts, setUmlauts] = useState(
    {
      "ä" : "a",
      "ö" : "o",
      "å" : "o"
    }
);

//tyylien haku
const tyylit = useStyles();
//datalle array
const [data, setData] = useState({
                                    tiedot1 : [],
                                    tiedot2 : [],
                                    virhe : null,
                                    tiedotHaettu : false
                                });


    //virheilmoitusta varten muuttujat + funktio
    const [open, setOpen] = React.useState(true);
    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
          return;
        }
        setOpen(false);
      };

//haetaan tiedot ja katsotaan virhe
const haeTiedot = async (hakua) => {

    const yhteys = await fetch(`https://so3server.herokuapp.com/saatilanne/${hakua}`);
    const tiedot = await yhteys.json();

        if (tiedot.cod === "404") {
        setData({
            ...data,
            virhe : true,
            tiedotHaettu : false
            });
            console.log(data)
        }
        else    {
            setData({
                    ...data,
                    tiedot1 : [tiedot],
                    tiedot2 : tiedot.weather,
                    virhe : null,
                    tiedotHaettu : true
                    });
            if(tiedot.weather[1]){
            setTuplat(true);
        }   else{
            setTuplat(false);
        }
        }

    
}   //useeffectillä päivitys ja seurataan hakusyötön muuttujaa
    useEffect(() => {
        haeTiedot(hakeminen);
        console.log(data)
        if(data.tiedot2[1]){
            setTuplat(true);
        }   else{
            setTuplat(false);
        }
    },[hakeminen]);

//hakufunktio jota kutsutaan haettaessa - vaihtaa haettavan url arvon
function haku(event){
    if (event.key === 'Enter'){
        setDialogiShow(false)
        let str = haettava;
        //vanhan tyylin ääkkösmuutos - lähes copypaste vanhasta tehtävästä
        str = str.replace(/ä|ö|å/gi, function(matched){
            return umlauts[matched];
        })                           
    setHakeminen(str)
    }
}
    return (
    <Container>
        <Button
        variant="contained"
        color="primary"
        size="large"
        className={tyylit.nappi}
        fullWidth={true}
        onClick={ () => { setDialogiShow(true)}}
        >Vaihda kaupunki
    </Button>
    <Dialog open={dialogiShow} fullWidth={true}>
        <DialogTitle>
             Syötä kaupungin nimi:
        </DialogTitle>
    <DialogContent>
        <TextField 
            fullWidth={true} 
            id="standard-basic" 
            label="Nimi"
            placeholder="Esim... Seinäjoki" 
            autoFocus={true}
            onChange={(e) => {setHaettava(e.target.value)}}
            onKeyPress={ (e) => {haku(e)}}
        />
    </DialogContent>
    </Dialog>

    {(data.virhe)
    ?    <><Snackbar open={open} autoHideDuration={5000} onClose={handleClose}>
                <Alert onClose={handleClose} severity="error">
                Virhe: etsimääsi kaupunkia ei löytynyt!
                </Alert>
            </Snackbar>
        
        <Grid container>
        {data.tiedot1.map((tieto) => {
        return (<List>
            <ListItem className={tyylit.listausotsikko}>{tieto.name}      
        </ListItem>
        {(tuplat)
        ? <ListItem className={tyylit.listausotsikko}>{tieto.weather[0].description}
            <img alt=""
            src={`http://openweathermap.org/img/wn/${tieto.weather[0].icon}.png`}
            />
        {tieto.weather[1].description}
            <img alt=""
            src={`http://openweathermap.org/img/wn/${tieto.weather[1].icon}.png`}
            />
        </ListItem>    
        : <ListItem className={tyylit.listausotsikko}>{tieto.weather[0].description}
            <img alt=""
            src={`http://openweathermap.org/img/wn/${tieto.weather[0].icon}.png`}
            />
        </ListItem>    
        } 
        <Grid container className={tyylit.root} spacing={0}>  
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Lämpötila: {tieto.main.temp}°C</ListItem></Grid>         
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Tuntuu kuin: {tieto.main.feels_like}°C</ListItem></Grid> 
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>24H Minimilämpötila: {tieto.main.temp_min}°C</ListItem></Grid>   
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>24H Maksimilämpötila: {tieto.main.temp_max}°C</ListItem></Grid>   
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Ilmanpaine: {tieto.main.pressure} Pa</ListItem></Grid>     
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Ilmankosteus: {tieto.main.humidity}%</ListItem></Grid> 
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Tuulen nopeus: {tieto.wind.speed} m/s</ListItem></Grid> 
            <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Pilvisyys: {tieto.clouds.all}%</ListItem></Grid> 
        </Grid> 
        </List>
        );
        })}
        </Grid>
        </>
    :   <>
        {data.tiedot1.map((tieto) => {
        return (<List>
                <ListItem className={tyylit.listausotsikko}>{tieto.name}      
            </ListItem>
            {(tuplat)
            ? <ListItem className={tyylit.listausotsikko}>{tieto.weather[0].description}
                <img alt=""
                src={`http://openweathermap.org/img/wn/${tieto.weather[0].icon}.png`}
                />
            {tieto.weather[1].description}
                <img alt=""
                src={`http://openweathermap.org/img/wn/${tieto.weather[1].icon}.png`}
                />
            </ListItem>    
            : <ListItem className={tyylit.listausotsikko}>{tieto.weather[0].description}
                <img alt=""
                src={`http://openweathermap.org/img/wn/${tieto.weather[0].icon}.png`}
                />
            </ListItem>    
            } 
            <Grid container className={tyylit.root} spacing={0}>  
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Lämpötila: {tieto.main.temp}°C</ListItem></Grid>         
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Tuntuu kuin: {tieto.main.feels_like}°C</ListItem></Grid> 
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>24H Minimilämpötila: {tieto.main.temp_min}°C</ListItem></Grid>   
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>24H Maksimilämpötila: {tieto.main.temp_max}°C</ListItem></Grid>   
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Ilmanpaine: {tieto.main.pressure} Pa</ListItem></Grid>     
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Ilmankosteus: {tieto.main.humidity}%</ListItem></Grid> 
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Tuulen nopeus: {tieto.wind.speed} m/s</ListItem></Grid> 
                <Grid item className={tyylit.listgrid} xs={6}><ListItem className={tyylit.listaus}>Pilvisyys: {tieto.clouds.all}%</ListItem></Grid> 
            </Grid> 
            </List>      
        );
        })}
        </>
    }
    
    </Container>
    );
}

export default Saat;