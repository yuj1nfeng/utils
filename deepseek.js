const getBalance = async () => {
  const url = 'https://api.deepseek.com/user/balance';
  const headers = {
    authorization: `Bearer ${process.env['DEEPSEEK_API_KEY']}`,
    accept: 'application/json',
  };

  const response = await fetch(url, { method: 'GET', headers });
  const { is_available, balance_infos } = await response.json();
  return { is_available, balance: balance_infos[0]['total_balance'], currency: balance_infos[0]['currency'] };
};

export default {
  getBalance,
};
