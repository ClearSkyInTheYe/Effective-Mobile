import requests

data = {
    'email': 'ab@gmail.com',
    'password': '123456',
    'name': 'asd',
    'lastname': 'qew',
    'surname': 'zxc',
    'birthDate': "1994-05-18"  # YYYY-MM-DD
}

# res = requests.post('http://127.0.0.1:3000/api/register', json=data)  # <= ключевая правка
login = {
    'email': 'ab@gmail.com',
    'password': '123456'
}
res = requests.post('http://127.0.0.1:3000/api/login', json=login, timeout=3)
print(res.status_code, res.text)
token=res.json().get('token')

users = requests.get('http://127.0.0.1:3000/api/users', headers={"Authorization": token})
print(users.text, users.status_code)
user = requests.get('http://127.0.0.1:3000/api/users/2', headers={"Authorization": token})
print(user.text, user.status_code)
block = requests.post('http://127.0.0.1:3000/api/users/1/block', headers={"Authorization": token})
print(block.status_code)
# //   email String  @unique
# //   password String
# //   name  String
# //   lastname String
# //   surname String
# //   birthDate  DateTime  @db.Date