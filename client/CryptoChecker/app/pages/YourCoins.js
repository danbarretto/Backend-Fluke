import React, {useEffect, useState, useContext} from 'react';
import {
  Button,
  DataTable,
  ActivityIndicator,
  FAB,
  Title,
} from 'react-native-paper';
import axios from 'axios';
import {StyleSheet, View, ScrollView} from 'react-native';
import AuthContext from '../components/AuthContext';
import SInfo from 'react-native-sensitive-info';
import AddCoin from '../components/AddCoin';
import EditCoin from '../components/EditCoin';
import { getToken } from '../config/getToken';

const YourCoins = ({setCoinName}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addCoin, setAddCoin] = useState(false);
  const [editCoin, setEditCoin] = useState(false);
  const [userName, setUserName] = useState('');
  const [select, setSelect] = useState('');

  let config;
  const {showErrorModal} = useContext(AuthContext);

  const fetchData = async () => {
    setLoading(true);
    const token = await getToken()
    config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    axios
      .get(
        'https://us-central1-flukebackend.cloudfunctions.net/app/user/getCurrencies',
        config,
      )
      .then(async (result) => {
        if (result.data.message !== undefined) {
          showErrorModal('Você não possui nenhuma cripto moeda cadastrada!');
          setUserName(result.data.userName);
          setLoading(false);
          return;
        }
        const coins = result.data.currencies.map((curr) => curr.Name);
        const prices = await axios.post(
          'https://us-central1-flukebackend.cloudfunctions.net/app/api/getPrices',
          {names: coins},
          config,
        );

        let currencies = result.data.currencies;
        setUserName(result.data.userName);

        currencies = currencies.map((curr) => ({
          ...curr,
          price: prices.data[curr.Name].BRL,
        }));
        const newRows = currencies.map((currency) => {
          return (
            <DataTable.Row
              key={currency.Name}
              onPress={() => {
                setCoinName(currency.Name);
              }}>
              <DataTable.Cell style={{justifyContent: 'center'}} centered>
                {currency.Name}
              </DataTable.Cell>
              <DataTable.Cell style={{justifyContent: 'center'}} centered>
                {currency.price.toFixed(2)}
              </DataTable.Cell>
              <DataTable.Cell
                style={{justifyContent: 'center'}}
                onPress={() => {
                  setEditCoin(true)
                  setSelect(currency.Name);
                }}>
                {currency.Quantidade}
              </DataTable.Cell>
              <DataTable.Cell style={{justifyContent: 'center'}} centered>
                {(currency.Quantidade * currency.price).toFixed(2)}
              </DataTable.Cell>
            </DataTable.Row>
          );
        });
        setRows(newRows);
        setLoading(false);
      })
      .catch(() => {
        alert('Erro ao resgatar moedas!');
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {!loading && (
        <>
          <Title>Bem-vindo(a) {userName}!</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title style={{justifyContent: 'center'}}>
                Moeda
              </DataTable.Title>
              <DataTable.Title
                style={{justifyContent: 'center'}}
                numberOfLines={2}>
                Valor Un (R$)
              </DataTable.Title>
              <DataTable.Title style={{justifyContent: 'center'}}>
                Quantidade
              </DataTable.Title>
              <DataTable.Title 
                style={{justifyContent: 'center'}}
                numberOfLines={2}>
                Total (R$)
              </DataTable.Title>
            </DataTable.Header>
            {rows}
          </DataTable>
        </>
      )}
      <AddCoin
        refreshData={() => fetchData()}
        visibleInit={addCoin}
        hideDialog={() => setAddCoin(false)}
      />
      <EditCoin
        refreshData={() => fetchData()}
        visibleInit={editCoin}
        hideDialog={() => setEditCoin(false)}
        code={select}
      />
      <ActivityIndicator animating={loading} size={'large'} />
      {!addCoin ? (
        <FAB
          mode="outlined"
          icon="plus"
          style={styles.fab}
          onPress={() => setAddCoin(true)}
        />
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    //backgroundColor: '#7a7985',
  },
});

export default YourCoins;
