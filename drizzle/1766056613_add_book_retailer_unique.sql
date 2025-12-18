ALTER TABLE book_retailer_link
ADD CONSTRAINT uq_book_retailer UNIQUE (book_id, retailer_id);
