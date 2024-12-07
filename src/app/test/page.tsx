

export default async function Page() {
  const getChat = await fetch(
    "http://localhost:8787/db/check?chatId=ihUqSFPlN9"
  ).then((resp) => resp.json());
  const getMessages = await fetch(
    `http://localhost:8787/db/getMessages?chatId=ihUqSFPlN9`
  ).then((resp) => resp.json());
  return <div>{JSON.stringify(getMessages)}</div>;
}
