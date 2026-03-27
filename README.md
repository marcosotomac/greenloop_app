# GREEN LOOP 

This repository contains the source code for the backend of the project, developed with Java and Spring Boot 🌱.

## Environment Setup

### Required Environment Variables

Before running the application, you need to set up the following environment variables:

```bash
# GitHub Models API Key for AI functionality
export GITHUB_MODELS_API_KEY=your-github-models-api-key-here
```

### Setting up GitHub Models API Key

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token with appropriate permissions
3. Set the environment variable before running the application

### Configuration Files

The application uses placeholder values in `src/main/resources/application.properties`. Make sure to set the actual values via environment variables.

Project Members

| Name | GitHub User | Email |
|----------|----------|----------|
| Marco Soto   | Marco Soto Maceda   | marco.soto.m@utec.edu.pe   |
| Diego Alarcón    | Diegoalarcon03   | diego.alarcon.b@utec.edu.pe   |


## Prerequisites 🔧
Before setting up the project, ensure you have the following installed on your machine:

+ Java: Recommended version 17 or higher
+ PostgreSQL: Recommended latest version 16
+ Docker: Latest version
+ IntelliJ IDEA: Latest version


## Getting Started 

To set up the project on your local machine, follow these steps:

1. Clone the Repository

Open your terminal and clone the repository using the following command:

```
git clone https://github.com/CS2031-DBP/proyecto-backend-greenloopppp.git
```

2. Navigate to the Project Directory

Change to the project directory:

```
cd proyecto-backend-greenloopppp
```

3. Open the Project in Your Preferred IDE

Preferably use IntelliJ IDEA for this project. Launch IntelliJ IDEA, click on "Open", and select the project directory you just cloned.

4. Run the Application

Run the MureApplication class to start the application. IntelliJ will automatically handle the dependencies as specified in the pom.xml file since the project uses Maven.

5. Set Up the Database

Ensure you have Docker installed on your machine. Then, run the following command to start the PostgreSQL database using Docker:

```
docker-compose up
```

Here is the Docker configuration for reference:
```
services:
  db:
  image: postgres:latest
  container_name: proyecto-backend-greenloop
  restart: always
  environment:
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: database
  ports:
     - "5555:5432"

```

Following these steps will set up the Mure project on your local machine, allowing you to explore and develop further.

## Entity-Relationship Diagram

![image](https://github.com/user-attachments/assets/b0fe1ac3-8ff6-4ae8-9728-a8add01fdb88)

## Endpoints  

Auth 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /auth/singup  | Register a new user and send a welcome email.   |
| POST   | /auth/singin   | Authenticate a user and return a JWT token.   |
| GET    | /auth/me   | Retrieve the current authenticated user's details.   |


Chat 🗫
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /api/chats/start  | Start a new chat between two users for a specific product.   |
| GET   | /api/chats/my-chats   | Retrieve all chats for the currently authenticated user.   |
| GET    | /api/chats/{chatId}/messages   | Retrieve all messages for a specific chat by its ID.  |
| GET    | /api/chats/product/{productId}  | Retrieve all chats related to a specific product by its ID.   |
| POST    | /api/chats/{chatId}/messages   | Send a message in a specific chat by its ID.   |

Chatbot 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /AI/prompt  | Generate a response based on the given prompt.   |

Community 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /api/communities  | Create a new community.   |
| GET   | /api/communities  | Retrieve all communities.   |
| GET    | /api/communities/{id}   | Retrieve a specific community by its ID.  |
| POST    | /api/communities/{id}/join  | Join a specific community by its ID.   |
| POST    | /api/communities/{id}/leave   | Leave a specific community by its ID.   |
| GET    | /api/communities/user  | Retrieve all communities the authenticated user is a member of.   |

Donation 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /api/donations | Create a new donation.   |
| GET   | /api/donations   | Retrieve all available donations.   |
| GET    | /api/donations/user   | Retrieve all donations created by the authenticated user.  |
| GET    | /api/donations/{id} | Retrieve a specific donation by its ID.   |
| POST    | /api/donations/{id}/request   | Request a specific donation by its ID.   |
| PUT    | /api/donations/{id}   | Update the status of a specific donation by its ID.   |

Exchange 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /api/exchanges | Create a new exchange request.   |
| PUT   | /api/exchanges/{exchangeId}/accept  | Accept a specific exchange request by its ID.   |
| PUT    | /api/exchanges/{exchangeId}/complete   | Mark a specific exchange as completed by its ID.  |
| PUT      | /api/exchanges/{exchangeId}/reject | Reject a specific exchange request by its ID.   |
| PUT    | /api/exchanges/{exchangeId}/cancel   | Cancel a specific exchange request by its ID.  |
| GET    | /api/exchanges/requested | Retrieve all exchange requests made by the authenticated user.  |
| GET    | /api/exchanges/provided   | Retrieve all exchange requests received by the authenticated user.  |

Message 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /messages/send | Send a message from one user to another.   |
| GET   | /messages/chat   | Retrieve the chat history between two users.   |
| GET    | /messages/sender   | Retrieve all messages sent by a specific user.  |
| GET    | /messages/receiver |Retrieve all messages received by a specific user.   |
| GET    | /messages/user | Retrieve all messages associated with a specific user (sent or received).   |

Notification 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   |  /api/notifications | Create a new notification (admin only).  |
| GET   | /api/notifications   | Retrieve all notifications for the authenticated user (paginated).  |
| GET    | /api/notifications/unread   | Retrieve all unread notifications for the authenticated user.  |
| PUT    | /api/notifications/{id}/read |Mark a specific notification as read by its ID.  |
| PUT    | /api/notifications/read-all | Mark all notifications as read for the authenticated user.  |
| GET    | /api/notifications/count | Retrieve the count of notifications for the authenticated user.  |
| GET    | /api/notifications/recent | Retrieve recent notifications (last N days) for the authenticated user.   |
| GET    | /api/notifications/type/{type} | Retrieve notifications by type for the authenticated user.   |
| DELETE    | /api/notifications/{id} |Delete a specific notification by its ID.   |
| DELETE    | /api/notifications | Delete all notifications for the authenticated user.   |

Post 
| Method | Endpoint | Description |
|----------|----------|----------|
| GET    | /post/all   | Retrieve all recent posts.  |
| GET    | /post/{userId} | Retrieve all posts created by a specific user by their ID.   |
| POST    | /post/create   | Create a new post. |

Product 
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   | /product | Create a new product.   |
| GET   |  /product/{id}   | Retrieve a specific product by its ID.  |
| PUT    | /product |  Update an existing product.  |
| DELETE    | /product/{id} | Delete a specific product by its ID.   |
| GET   | /product | Retrieve all products.   |
| GET    | /product/search   | Search for products by name.  |
| GET    | /product/exchange/available | Retrieve all products available for exchange.   |
| GET    | /product/exchange/user | Retrieve all products available for exchange by the authenticated user.   |
| PUT    | /product/{id}/exchange-status | Update the exchange status of a specific product by its ID.  |
| GET    | /product/{id}/exchange-matches | Find exchange matches for a specific product by its ID.  |

Report 
| Method | Endpoint | Description |
|----------|----------|----------|
| GET    | /reports   | Retrieve all reports.  |
| GET    | /reports/{id} | Retrieve a specific report by its ID.      |
| POST    | /reports    | Create a new report.  |
| PUT    | /reports/{id}  |  Update an existing report by its ID.   |
| DELETE    | /reports/{id} |  Delete a specific report by its ID.   |


User 
| Method | Endpoint | Description |
|----------|----------|----------|
| GET    | /user/{id}/communities   | Retrieve all communities associated with a user.  |

Wishlist  
| Method | Endpoint | Description |
|----------|----------|----------|
| POST   | /api/wishlists | Create a new wishlist.   |
| GET   | /api/wishlists   | Retrieve all wishlists for the authenticated user. |
| GET   |  /api/wishlists/{id}   | Retrieve a specific wishlist by its ID for the authenticated user.  |
| PUT    | /  /api/wishlists/{id} | Update a specific wishlist by its ID for the authenticated user.  |
| DELETE    | /api/wishlists/{id} |  Delete a specific wishlist by its ID for the authenticated user.  |
| POST   | /api/wishlists/add-product | Add a product to a wishlist.   |
| DELETE    | /api/wishlists/{wishListId}/products/{productId} |  Remove a product from a specific wishlist.   |
| GET   |  /api/wishlists/{id}/matching-products     | Retrieve matching products for a specific wishlist.  |

