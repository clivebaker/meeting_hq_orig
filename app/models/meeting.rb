class Meeting < ApplicationRecord
  belongs_to :organisation


  validates_presence_of :name, on: [:update, :create], message: "can't be blank"

  validates_uniqueness_of :name, scope: :organisation_id, on: [:update, :create], message: "must be unique"
end
